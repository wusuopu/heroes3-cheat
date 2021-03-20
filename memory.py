#!/usr/bin/env python
# encoding: utf-8

import ctypes
import ctypes.wintypes
import os
import struct
import log

# https://msdn.microsoft.com/en-us/library/aa383751#DWORD_PTR
if ctypes.sizeof(ctypes.c_void_p) == ctypes.sizeof(ctypes.c_ulonglong):
    DWORD_PTR = ctypes.c_ulonglong
elif ctypes.sizeof(ctypes.c_void_p) == ctypes.sizeof(ctypes.c_ulong):
    DWORD_PTR = ctypes.c_ulong
PVOID = ctypes.wintypes.LPVOID
SIZE_T = ctypes.c_size_t

# 进程权限相关：https://docs.microsoft.com/en-us/windows/desktop/ProcThread/process-security-and-access-rights
PROCESS_QUERY_INFORMATION = 0x0400
PROCESS_VM_OPERATION = 0x0008
PROCESS_VM_READ = 0x0010
PROCESS_VM_WRITE = 0x0020


def print_error(name):
    print(name, ctypes.WinError(ctypes.get_last_error()))


def float_to_hex(number):
    """
    将单浮点数转为16进制
    """
    return struct.unpack('<I', struct.pack('<f', number))[0]


def double_to_hex(number):
    """
    将双浮点数转为16进制
    """
    return struct.unpack('<Q', struct.pack('<d', number))[0]


def hex_to_float(hex_number):
    """
    将16进制转为单浮点数
    """
    return struct.unpack('<f', struct.pack('<I', hex_number))[0]


def hex_to_double(hex_number):
    """
    将16进制转为双浮点数
    """
    return struct.unpack('<d', struct.pack('<Q', hex_number))[0]


def bytes_to_int(b, size=4, unsigned=True):
    """
    将字节转为整数
    """
    # char
    f = '<B' if unsigned else 'b'
    if size == 8:       # long long
        f = '<Q' if unsigned else 'q'
    if size == 4:       # int
        f = '<I' if unsigned else 'i'
    if size == 2:       # short
        f = '<H' if unsigned else 'h'
    return struct.unpack(f, b)[0]


def int_to_bytes(i, size=4, unsigned=True):
    """将整数转为字节"""
    # char
    f = '<B' if unsigned else 'b'
    if size == 8:       # long long
        f = '<Q' if unsigned else 'q'
    if size == 4:       # int
        f = '<I' if unsigned else 'i'
    if size == 2:       # short
        f = '<H' if unsigned else 'h'
    return struct.pack(f, i)


def get_process_info(pid):
    # https://docs.microsoft.com/en-us/windows/desktop/psapi/enumerating-all-modules-for-a-process
    hProcess = ctypes.windll.kernel32.OpenProcess(
        PROCESS_QUERY_INFORMATION | PROCESS_VM_READ,
        False, pid
    )
    if not hProcess:
        return

    count = 100                       # 仅获取进程执行的文件
    hMods = (ctypes.c_ulong * count)()
    cbNeeded = ctypes.c_ulong()

    ctypes.windll.psapi.EnumProcessModules(
        hProcess,
        ctypes.byref(hMods),
        ctypes.sizeof(hMods),
        ctypes.byref(cbNeeded)
    )
    num = min(cbNeeded.value / ctypes.sizeof(ctypes.c_ulong), count)
    i = 0

    exe_name = ''
    base_addr = {}      # 各个模块的基址
    while i < num:
        szModName = ctypes.c_buffer(100)
        # ret = ctypes.windll.psapi.GetModuleFileNameExA(
            # hProcess,
            # hMods[i],
            # szModName,
            # ctypes.sizeof(szModName)
        # )
        ret = ctypes.windll.psapi.GetModuleBaseNameA(
            hProcess,
            hMods[i],
            szModName,
            ctypes.sizeof(szModName)
        )
        if ret:
            base_addr[szModName.value] = hMods[i]
            log.debug("process: %8d\t%x\t%s" % (pid, hMods[i], szModName.value))
            if i == 0:
                exe_name = szModName.value
        i += 1

    ctypes.windll.kernel32.CloseHandle(hProcess)
    return (pid, exe_name, base_addr)


def list_process():
    # https://docs.microsoft.com/en-us/windows/desktop/api/psapi/nf-psapi-enumprocesses
    count = 1024
    lpidProcess = (ctypes.c_ulong * count)()
    lpcbNeeded = ctypes.c_ulong()

    ret = ctypes.windll.psapi.EnumProcesses(
        ctypes.byref(lpidProcess),
        ctypes.sizeof(lpidProcess),
        ctypes.byref(lpcbNeeded)
    )

    if ret != 1:
        print_error('EnumProcesses')
        raise Exception('list_process error')

    num = min(lpcbNeeded.value / ctypes.sizeof(ctypes.c_ulong), count)
    i = 0

    result = {}
    while i < num:
        pid = lpidProcess[i]
        i += 1
        ret = get_process_info(pid)
        if ret and ret[1]:
            result[ret[1]] = ret[0]

    return result


def query_virtual(hProcess, base_addr):
    """
    查询虚拟地址的信息
    """
    MEM_COMMIT = 0x00001000;
    PAGE_READWRITE = 0x04;

    class MEMORY_BASIC_INFORMATION(ctypes.Structure):
        """https://msdn.microsoft.com/en-us/library/aa366775"""
        _fields_ = (('BaseAddress', PVOID),
                    ('AllocationBase',    PVOID),
                    ('AllocationProtect', ctypes.wintypes.DWORD),
                    ('RegionSize', SIZE_T),
                    ('State',   ctypes.wintypes.DWORD),
                    ('Protect', ctypes.wintypes.DWORD),
                    ('Type',    ctypes.wintypes.DWORD))

    mbi = MEMORY_BASIC_INFORMATION()
    ret = ctypes.windll.kernel32.VirtualQueryEx(
        hProcess,
        base_addr,
        ctypes.byref(mbi),
        ctypes.sizeof(mbi)
    )
    if not ret:
        print_error('VirtualQueryEx')
        return {}

    return {
        'protect': mbi.Protect == PAGE_READWRITE,
        'state': mbi.State == MEM_COMMIT,
        'size': mbi.RegionSize,
    }


def get_system_info():
    """
    获取系统信息: 可用内存的起始与结束地址
    """
    class SYSTEM_INFO(ctypes.Structure):
        """https://msdn.microsoft.com/en-us/library/ms724958"""
        class _U(ctypes.Union):
            class _S(ctypes.Structure):
                _fields_ = (('wProcessorArchitecture', ctypes.wintypes.WORD),
                            ('wReserved', ctypes.wintypes.WORD))
            _fields_ = (('dwOemId', ctypes.wintypes.DWORD), # obsolete
                        ('_s', _S))
            _anonymous_ = ('_s',)
        _fields_ = (('_u', _U),
                    ('dwPageSize', ctypes.wintypes.DWORD),
                    ('lpMinimumApplicationAddress', ctypes.wintypes.LPVOID),
                    ('lpMaximumApplicationAddress', ctypes.wintypes.LPVOID),
                    ('dwActiveProcessorMask',   DWORD_PTR),
                    ('dwNumberOfProcessors',    ctypes.wintypes.DWORD),
                    ('dwProcessorType',         ctypes.wintypes.DWORD),
                    ('dwAllocationGranularity', ctypes.wintypes.DWORD),
                    ('wProcessorLevel',    ctypes.wintypes.WORD),
                    ('wProcessorRevision', ctypes.wintypes.WORD))
        _anonymous_ = ('_u',)

    sysinfo = SYSTEM_INFO()
    if not ctypes.windll.kernel32.GetSystemInfo(ctypes.byref(sysinfo)):
        print_error('GetSystemInfo')
        return {}

    return {
        'start_addr': sysinfo.lpMinimumApplicationAddress,
        'end_addr': sysinfo.lpMaximumApplicationAddress
    }


def read_process(hProcess, base_addr, byte_num=2):
    """
    读取特定内存的值
    """
    if byte_num == 1:
        buf = ctypes.c_byte()
    elif byte_num == 2:
        buf = ctypes.c_short()
    elif byte_num == 4:
        buf = ctypes.c_int32()
    elif byte_num == 8:
        buf = ctypes.c_int64()
    else:
        buf = ctypes.c_buffer(b'', byte_num)

    nread = SIZE_T()
    ret = ctypes.windll.kernel32.ReadProcessMemory(
        hProcess,
        base_addr,
        ctypes.byref(buf),
        ctypes.sizeof(buf),
        ctypes.byref(nread)
    )
    if not ret:
        print_error('ReadProcessMemory')
        raise Exception('ReadProcessMemory')

    return getattr(buf, 'raw', buf.value)


def write_process(hProcess, base_addr, value, byte_num=2):
    """
    往特定内存地址写入数据
    """
    if byte_num == 1:
        buf = ctypes.c_byte(value)
    elif byte_num == 2:
        buf = ctypes.c_short(value)
    elif byte_num == 4:
        buf = ctypes.c_int32(value)
    elif byte_num == 8:
        buf = ctypes.c_int64(value)
    else:
        buf = ctypes.c_buffer(value, byte_num)
    nwrite = SIZE_T()
    ret = ctypes.windll.kernel32.WriteProcessMemory(
        hProcess,
        base_addr,
        ctypes.byref(buf),
        ctypes.sizeof(buf),
        ctypes.byref(nwrite)
    )

    return not not ret


def close_process(hProcess):
    ctypes.windll.kernel32.CloseHandle(hProcess)


def inject_process(pid):
    """
    注入某个进程
    """
    hProcess = ctypes.windll.kernel32.OpenProcess(
        PROCESS_QUERY_INFORMATION|PROCESS_VM_READ|PROCESS_VM_OPERATION|PROCESS_VM_WRITE,
        False, pid
    )
    if not hProcess:
        print_error('OpenProcess %s' % (pid))
        return

    return hProcess


def main():
    # inject_process(2996)
    # print(get_system_info())
    print(list_process())

if __name__ == '__main__':
    main()
