#!/usr/bin/env python
# encoding: utf-8

import time
import collections
import ctypes
import memory

EXE_ADDR = 0x00400000

# 以下是32位系统的默认地址，64位系统会不一样
HD_GAME_ADDR = {
    # 红色玩家黄金资源地址，每个玩家间隔 0x0168； 宝石 水晶 硫磺 石头 水银 木头 依次减 0x04 字节
    'play1_gold': 0x01371534 + 0 * 0x0168,
    'play2_gold': 0x01371534 + 1 * 0x0168,
    'play3_gold': 0x01371534 + 2 * 0x0168,
    'play4_gold': 0x01371534 + 3 * 0x0168,
    'play5_gold': 0x01371534 + 4 * 0x0168,
    'play6_gold': 0x01371534 + 5 * 0x0168,
    'play7_gold': 0x01371534 + 6 * 0x0168,
    'play8_gold': 0x01371534 + 7 * 0x0168,
    # 第1个英雄： 欧灵 基地，每个英雄间隔 0x0492
    'hero_1': 0x01371FD0,
    # 第1玩家地址，每个玩家间隔 0x0168
    'player1': 0x01371480,
    # 第1个城镇，每个城镇间隔 0x168
    'town_1_base': 0x1371fc4,       # [0x1371fc4] [hero_1 - 0x0c]
}
NO_HD_GAME_ADDR = {
    # 红色玩家黄金资源地址，每个玩家间隔 0x0168； 宝石 水晶 硫磺 石头 水银 木头 依次减 0x04 字节
    'play1_gold': 0x01620BEC + 0 * 0x0168,
    'play2_gold': 0x01620BEC + 1 * 0x0168,
    'play3_gold': 0x01620BEC + 2 * 0x0168,
    'play4_gold': 0x01620BEC + 3 * 0x0168,
    'play5_gold': 0x01620BEC + 4 * 0x0168,
    'play6_gold': 0x01620BEC + 5 * 0x0168,
    'play7_gold': 0x01620BEC + 6 * 0x0168,
    'play8_gold': 0x01620BEC + 7 * 0x0168,
    # 第1个英雄： 欧灵 基地，每个英雄间隔 0x0492
    'hero_1': 0x01621688,
    # 第1玩家地址，每个玩家间隔 0x0168
    'player1': 0x01620b38,
    # 第1个城镇，每个城镇间隔 0x168
    'town_1_base': 0x0162167C,       # [0x0162167C]  [hero_1 - 0x0c], [hero_1 - 0x08]: 最后城镇的地址
}

GAME_ADDR = NO_HD_GAME_ADDR

# HD版
HD_POINTER = EXE_ADDR + 0x0029CCFC
# 非HD版
NO_HD_POINTER = EXE_ADDR + 0x0042B0BC
POINTER = HD_POINTER
GAME_INITED = False

# 所有玩家颜色
PLAYER_COLORS = ['红', '蓝', '褐', '绿', '棕', '紫', '青', '粉']
RESOURCE_NAMES = ['木头', '水银', '石头', '硫磺', '水晶', '宝石', '黄金']


def bytes2str(b, code='gbk'):
    try:
        return b.split(b'\x00', 1)[0].decode(code)
    except Exception:
        return ''


def bytes2number(buf, offset, size, unsigned=True):
    return memory.bytes_to_int(
        buf[offset:offset+size], size, unsigned
    )


def ints2bytes(numbers, size=4, unsigned=True):
    ret = []
    for i in numbers:
        ret.append(memory.int_to_bytes(i, size, unsigned))
    return b''.join(ret)


# ===================数据结构=====================
class Player(ctypes.Structure):
    # size 0x168
    _fields_ = [
        ('playeridx', ctypes.c_int8),       # 0x00 0~7
        ('heroescount', ctypes.c_uint8),    # 0x01
        ('_u1', ctypes.c_char * 2),         # 0x02
        ('curhero', ctypes.c_int32),        # 0x04 当前英雄编号 0~156
        ('heroes', ctypes.c_uint32 * 8),    # 0x08 所有英雄编号 0~156
        ('herol', ctypes.c_int32),          # 0x28
        ('heror', ctypes.c_int32),          # 0x2c
        ('_u2', ctypes.c_char * 13),        # 0x30
        ('daysleft', ctypes.c_int8),        # 0x3d
        ('townscount', ctypes.c_int8),      # 0x3e
        ('curtown', ctypes.c_uint8),        # 0x3f 当前城镇编号 0~47
        ('towns', ctypes.c_uint8 * 48),     # 0x40 所有城镇编号 0~47
        ('_u3', ctypes.c_char * 4),         # 0x70
        ('tophero', ctypes.c_int32),        # 0x74
        ('_u4', ctypes.c_char * 0x24),      # 0x78
        ('wood', ctypes.c_uint32),          # 0x9c  木头
        ('mercury', ctypes.c_uint32),       # 0xa0  水银
        ('rock', ctypes.c_uint32),          # 0xa4  石头
        ('sulphur', ctypes.c_uint32),       # 0xa8  硫磺
        ('crystal', ctypes.c_uint32),       # 0xac  水晶
        ('gem', ctypes.c_uint32),           # 0xb0  宝石
        ('gold', ctypes.c_uint32),          # 0xb4  黄金
        ('_u5', ctypes.c_char * 0x14),      # 0xb8
        ('name', ctypes.c_char * 21),       # 0xcc
        ('activeflag', ctypes.c_int8),      # 1 active 0 sleep
        ('playerflag', ctypes.c_int8),      # 1 player 0 computer
        ('_u6', ctypes.c_char * 0x45),
        ('resimp', ctypes.c_double * 8),
    ]

    def to_json(self):
        data = {
            'playeridx': self.playeridx,
            'heroescount': self.heroescount,
            'curhero': self.curhero,
            'heroes': list(self.heroes),
            'daysleft': self.daysleft,
            'townscount': self.townscount,
            'curtown': self.curtown,
            'towns': list(self.towns),
            # 'resources': [self.wood, self.mercury, self.rock, self.sulphur, self.crystal, self.gem, self.gold],
            'name': bytes2str(self.name, 'gbk'),
            'activeflag': self.activeflag,
            'playerflag': self.playerflag,
        }
        return data


class BuildingsBitfield(ctypes.Structure):
    # size 0x08 最后20bits没有用到
    _fields_ = [
        ('u0', ctypes.c_uint8, 1),
        ('u1', ctypes.c_uint8, 1),
        ('u2', ctypes.c_uint8, 1),
        ('u3', ctypes.c_uint8, 1),
        ('u4', ctypes.c_uint8, 1),
        ('u5', ctypes.c_uint8, 1),
        ('u6', ctypes.c_uint8, 1),
        ('u7', ctypes.c_uint8, 1),
        ('u8', ctypes.c_uint8, 1),
        ('u9', ctypes.c_uint8, 1),
        ('u10', ctypes.c_uint8, 1),
        ('u11', ctypes.c_uint8, 1),
        ('u12', ctypes.c_uint8, 1),
        ('u13', ctypes.c_uint8, 1),
        ('u14', ctypes.c_uint8, 1),
        ('u15', ctypes.c_uint8, 1),
        ('u16', ctypes.c_uint8, 1),
        ('u17', ctypes.c_uint8, 1),
        ('u18', ctypes.c_uint8, 1),
        ('u19', ctypes.c_uint8, 1),
        ('u20', ctypes.c_uint8, 1),
        ('u21', ctypes.c_uint8, 1),
        ('u22', ctypes.c_uint8, 1),
        ('u23', ctypes.c_uint8, 1),
        ('u24', ctypes.c_uint8, 1),
        ('u25', ctypes.c_uint8, 1),
        ('grail', ctypes.c_uint8, 1),       # 神器
        ('u27', ctypes.c_uint8, 1),
        ('u28', ctypes.c_uint8, 1),
        ('u29', ctypes.c_uint8, 1),
        ('u30', ctypes.c_uint8, 1),         # 生物1
        ('u31', ctypes.c_uint8, 1),
        ('u32', ctypes.c_uint8, 1),
        ('u33', ctypes.c_uint8, 1),
        ('u34', ctypes.c_uint8, 1),
        ('u35', ctypes.c_uint8, 1),
        ('u36', ctypes.c_uint8, 1),
        ('u37', ctypes.c_uint8, 1),         # 升级生物1
        ('u38', ctypes.c_uint8, 1),
        ('u39', ctypes.c_uint8, 1),
        ('u40', ctypes.c_uint8, 1),
        ('u41', ctypes.c_uint8, 1),
        ('u42', ctypes.c_uint8, 1),
        ('u43', ctypes.c_uint8, 1),
        ('_unused0', ctypes.c_uint8, 4),
        ('_unused1', ctypes.c_uint16),
    ]

    def to_json(self):
        data = { 'origin_value': self.origin_value() }
        for field in self._fields_:
            name = field[0]
            value = getattr(self, name)
            data[name] = value
        return data

    def origin_value(self):
        size = ctypes.sizeof(self)
        addr = ctypes.byref(self)
        value = ctypes.string_at(addr, size)
        return list(value)

class Town(ctypes.Structure):
    # size 0x168
    _pack_ = 1 # 1字节对齐
    _fields_ = [
        ('idx', ctypes.c_int8),             # 0x00 0~47
        ('player', ctypes.c_int8),          # 0x01 0~7
        ('today_builded', ctypes.c_int8),   # 0x02 今日已建造: 0, 1
        ('_u_03', ctypes.c_char * 1),
        ('type', ctypes.c_int8),            # 0x04 城镇类型：城堡, 壁垒, 楼塔, 地狱, 墓园, 地下城, 据点, 要塞, 元素城
        ('xAxis', ctypes.c_uint8),          # 0x05 坐标
        ('yAxis', ctypes.c_uint8),          # 0x06
        ('zAxis', ctypes.c_uint8),          # 0x07
        ('_u_08', ctypes.c_char * 4),       # 0x08
        ('garrisonHero', ctypes.c_uint32),  # 0x0C 驻扎英雄编号
        ('visitingHero', ctypes.c_uint32),  # 0x10 来访英雄编号
        ('mageLevel', ctypes.c_uint8),      # 0x14 当前魔法行会等级
        ('_u_15', ctypes.c_char * 1),       # 0x15
        ('recruits', ctypes.c_uint16 * 7 * 2),  # 0x16  可招的新兵数量，升级与不升级
        ('_u_32', ctypes.c_char * 1),         # 0x32
        ('manaVortexAvailable', ctypes.c_uint8),         # 0x33 该周神力涡流是否可用
        ('mysticPondResourceCount', ctypes.c_uint32),    # 0x34 神秘资源数量
        ('mysticPondResourceType', ctypes.c_uint32),     # 0x38 神秘资源类型
        ('summoningPortalCreatureType', ctypes.c_uint32),       # 0x3C 召唤门生物 struct { INT32 type; INT32 amount; } size 0x06
        ('summoningPortalCreatureAmount', ctypes.c_uint16),     # 0x40 召唤门生物 struct { INT32 type; INT16 amount; } size 0x06
        ('_u_42', ctypes.c_char * 2),           # 0x42
        ('spells', ctypes.c_uint32 * 6 * 5),    # 0x44 每层魔法行会的魔法
        ('magicGuild', ctypes.c_uint8 * 5),     # 0xbc 每层魔法行会是否已建造 值依次： 05 04 03 02 01
        ('_u_c1', ctypes.c_char * 7),           # 0xc1
        ('name_pointer', ctypes.c_uint32),      # 0xc8 城镇名字指针 size 0x0C
        ('nameLen', ctypes.c_uint16),           # 0xcc 名字字节数
        ('_u_ce', ctypes.c_char * (0x0150 - 0xce)), # 0xce
        ('built', BuildingsBitfield),           # 0x0150 显示32个建筑是否已建造 size 0x08
        ('built2', BuildingsBitfield),          # 0x0158 实际32个建筑是否已建造 size 0x08
        ('buildableMask', BuildingsBitfield),   # 0x0160 32个建筑是否可建造 size 0x08
    ]

    def to_json(self):
        data = {
            'idx': self.idx,
            'player': self.player,
            'today_builded': self.today_builded,
            'type': self.type,
            'xAxis': self.xAxis,
            'yAxis': self.yAxis,
            'zAxis': self.zAxis,
            'garrisonHero': self.garrisonHero,
            'visitingHero': self.visitingHero,
            'mageLevel': self.mageLevel,
            'recruits': memory.array_to_list(self.recruits),
            'manaVortexAvailable': self.manaVortexAvailable,
            'mysticPondResourceCount': self.mysticPondResourceCount,
            'mysticPondResourceType': self.mysticPondResourceType,
            'summoningPortalCreatureType': self.summoningPortalCreatureType,
            'summoningPortalCreatureAmount': self.summoningPortalCreatureAmount,
            'spells': memory.array_to_list(self.spells),
            'magicGuild': memory.array_to_list(self.magicGuild),
            'name_pointer': self.name_pointer,
            'nameLen': self.nameLen,
            'built': self.built.to_json(),
            'built2': self.built2.to_json(),
            'buildableMask': self.buildableMask.to_json(),
        }
        return data


# ===================读取游戏=====================
def get_current_play(process):
    """获取当前玩家号"""
    pointer = memory.read_process(process, POINTER, 4)
    addr = pointer + 0xB4
    num = 0
    data = {}
    while num < 8:
        if addr == GAME_ADDR['play%d_gold' % (num+1)]:
            data['color'] = PLAYER_COLORS[num]
            data['num'] = num
            return data
        num += 1


def list_all_hero(process):
    # 全部英雄 156
    start_addr = GAME_ADDR['hero_1']
    number = 200
    i = 0
    data = []
    while i < number:
        addr = start_addr + (0x492 * i) + 0x22
        value = memory.read_process(process, addr, 32)
        name = value[1:]
        if not name or name.startswith(b'\xff\xff'):
            break
        name = bytes2str(name)
        if name:
            data.append({
                'num': i,
                'addr': addr - 0x22,
                'player': value[0],
                'name': name,
                'avator': value[1+13+4],
            })
        i += 1

    return data


def get_hero_info(process, num):
    base_addr = GAME_ADDR['hero_1'] + (0x0492 * num)
    buf = memory.read_process(process, base_addr, 0x492)
    data = collections.OrderedDict()
    data['num'] = num
    data['xAxis'] = bytes2number(buf, 0x00, 2),     # 坐标从左上角算起
    data['yAxis'] = bytes2number(buf, 0x02, 2),
    data['zAxis'] = bytes2number(buf, 0x04, 2),     # 0:up world, 1: under world
    data['visible'] = bytes2number(buf, 0x05, 1),
    data['color'] = PLAYER_COLORS[buf[0x22]],
    data['name'] = bytes2str(buf[0x23:(0x23+30)]),
    data['type'] = bytes2number(buf, 0x30, 1),      # 英雄类型 name + 13
    data['头像'] = bytes2number(buf, 0x34, 1),      # 英雄头像 type + 4
    data['魔法值'] = bytes2number(buf, 0x18, 2),
    data['特长'] = bytes2number(buf, 0x1A, 4),      # 英雄特长  前4个字节记录特长种类，后4个字节记录特长的具体信息
    data['移动力'] = bytes2number(buf, 0x4d, 2),
    data['经验'] = bytes2number(buf, 0x51, 4),
    data['等级'] = bytes2number(buf, 0x55, 2),
    data['攻击'] = bytes2number(buf, 0x476, 1),
    data['防御'] = bytes2number(buf, 0x477, 1),
    data['力量'] = bytes2number(buf, 0x478, 1),
    data['知识'] = bytes2number(buf, 0x479, 1),

    data['第1格兵数量'] = bytes2number(buf, 0xad, 4),
    data['第2格兵数量'] = bytes2number(buf, 0xb1, 4),
    data['第3格兵数量'] = bytes2number(buf, 0xb5, 4),
    data['第4格兵数量'] = bytes2number(buf, 0xb9, 4),
    data['第5格兵数量'] = bytes2number(buf, 0xbd, 4),
    data['第6格兵数量'] = bytes2number(buf, 0xc1, 4),
    data['第7格兵数量'] = bytes2number(buf, 0xc5, 4),
    data['第1格兵兵种'] = bytes2number(buf, 0x91, 4),
    data['第2格兵兵种'] = bytes2number(buf, 0x95, 4),
    data['第3格兵兵种'] = bytes2number(buf, 0x99, 4),
    data['第4格兵兵种'] = bytes2number(buf, 0x9d, 4),
    data['第5格兵兵种'] = bytes2number(buf, 0xa1, 4),
    data['第6格兵兵种'] = bytes2number(buf, 0xa5, 4),
    data['第7格兵兵种'] = bytes2number(buf, 0xa9, 4),

    # 1: 初级; 2: 中级; 3: 高级
    data['寻路术等级'] = bytes2number(buf, 0xC9, 1),
    data['箭术等级'] = bytes2number(buf, 0xCA, 1),
    data['后勤学等级'] = bytes2number(buf, 0xCB, 1),
    data['侦察术等级'] = bytes2number(buf, 0xCC, 1),
    data['外交术等级'] = bytes2number(buf, 0xCD, 1),
    data['航海术等级'] = bytes2number(buf, 0xCE, 1),
    data['领导术等级'] = bytes2number(buf, 0xCF, 1),
    data['智慧术等级'] = bytes2number(buf, 0xD0, 1),
    data['神秘术等级'] = bytes2number(buf, 0xD1, 1),
    data['幸运术等级'] = bytes2number(buf, 0xD2, 1),
    data['弹道术等级'] = bytes2number(buf, 0xD3, 1),
    data['鹰眼术等级'] = bytes2number(buf, 0xD4, 1),
    data['招魂术等级'] = bytes2number(buf, 0xD5, 1),
    data['理财术等级'] = bytes2number(buf, 0xD6, 1),
    data['火系魔法等级'] = bytes2number(buf, 0xD7, 1),
    data['气系魔法等级'] = bytes2number(buf, 0xD8, 1),
    data['水系魔法等级'] = bytes2number(buf, 0xD9, 1),
    data['土系魔法等级'] = bytes2number(buf, 0xDA, 1),
    data['学术等级'] = bytes2number(buf, 0xDB, 1),
    data['战术等级'] = bytes2number(buf, 0xDC, 1),
    data['炮术等级'] = bytes2number(buf, 0xDD, 1),
    data['学习能力等级'] = bytes2number(buf, 0xDE, 1),
    data['进攻术等级'] = bytes2number(buf, 0xDF, 1),
    data['防御术等级'] = bytes2number(buf, 0xE0, 1),
    data['智力等级'] = bytes2number(buf, 0xE1, 1),
    data['魔力等级'] = bytes2number(buf, 0xE2, 1),
    data['抵抗力等级'] = bytes2number(buf, 0xE3, 1),
    data['急救术等级'] = bytes2number(buf, 0xE4, 1),

    # 28项可学技能的显示位置: 1~28
    data['寻路术位置'] = bytes2number(buf, 0xE5, 1),
    data['箭术位置'] = bytes2number(buf, 0xE6, 1),
    data['后勤学位置'] = bytes2number(buf, 0xE7, 1),
    data['侦察术位置'] = bytes2number(buf, 0xE8, 1),
    data['外交术位置'] = bytes2number(buf, 0xE9, 1),
    data['航海术位置'] = bytes2number(buf, 0xEA, 1),
    data['领导术位置'] = bytes2number(buf, 0xEB, 1),
    data['智慧术位置'] = bytes2number(buf, 0xEC, 1),
    data['神秘术位置'] = bytes2number(buf, 0xED, 1),
    data['幸运术位置'] = bytes2number(buf, 0xEE, 1),
    data['弹道术位置'] = bytes2number(buf, 0xEF, 1),
    data['鹰眼术位置'] = bytes2number(buf, 0xF0, 1),
    data['招魂术位置'] = bytes2number(buf, 0xF1, 1),
    data['理财术位置'] = bytes2number(buf, 0xF2, 1),
    data['火系魔法位置'] = bytes2number(buf, 0xF3, 1),
    data['气系魔法位置'] = bytes2number(buf, 0xF4, 1),
    data['水系魔法位置'] = bytes2number(buf, 0xF5, 1),
    data['土系魔法位置'] = bytes2number(buf, 0xF6, 1),
    data['学术位置'] = bytes2number(buf, 0xF7, 1),
    data['战术位置'] = bytes2number(buf, 0xF8, 1),
    data['炮术位置'] = bytes2number(buf, 0xF9, 1),
    data['学习能力位置'] = bytes2number(buf, 0xFA, 1),
    data['进攻术位置'] = bytes2number(buf, 0xFB, 1),
    data['防御术位置'] = bytes2number(buf, 0xFC, 1),
    data['智力位置'] = bytes2number(buf, 0xFD, 1),
    data['魔力位置'] = bytes2number(buf, 0xFE, 1),
    data['抵抗力位置'] = bytes2number(buf, 0xFF, 1),
    data['急救术位置'] = bytes2number(buf, 0x100, 1),
    data['技能个数'] = bytes2number(buf, 0x101, 1),

    data['有魔法书'] = bytes2number(buf, 0x1B5, 4) == 0,    # 0x00000000: YES; 0xFFFFFFFF: NO
    data['士气幸运'] = bytes2number(buf, 0x107, 1),         # 0b11000000 0xC0 高士气，高幸运

    # 物品栏
    obj_index = 0
    obj_num = 64
    while obj_index < obj_num:
        data['行囊%02d' % (obj_index+1)] = bytes2number(buf, 0x1d4 + (8 * obj_index), 4),
        data['行囊%02d属性' % (obj_index+1)] = bytes2number(buf, 0x1d4 + (8 * obj_index) + 4, 4),
        obj_index += 1
    # 物品栏之后一个字节记录当前物品的数量
    data['行囊数量'] = bytes2number(buf, 0x1d4 + (8 * obj_index), 1)

    # file_name = 'hero_%d.txt' % (time.time())
    # print('file_name:', file_name)
    # with open(file_name, 'w') as fp:
    #     i = 0
    #     while i < 0x492:
    #         fp.write("%02x " % (buf[i]))
    #         i += 1
    #         if (i % 16) == 0:
    #             fp.write('\n')
    return data


def get_all_resources(process):
    # 获取所有玩家资源数据
    i = 0
    number = 8
    data = []
    while i < number:
        data.append({
            'color': PLAYER_COLORS[i],
            'data': [],
        })
        addr = GAME_ADDR['play1_gold'] + (0x0168 * i) - (0x04 * 6)
        value = memory.read_process(process, addr, 28)
        resource_num = 0
        resource_count = len(RESOURCE_NAMES)
        while resource_num < resource_count:
            offset = resource_num * 0x04
            data[i]['data'].append(memory.bytes_to_int(value[0+offset:4+offset], 4))
            resource_num += 1
        i += 1
    return data


def init_game_base_addr(process, is_hd):
    """初始化游戏基址"""
    global GAME_ADDR
    global POINTER
    global GAME_INITED

    if is_hd:
        GAME_ADDR = HD_GAME_ADDR
        POINTER = HD_POINTER
    else:
        GAME_ADDR = NO_HD_GAME_ADDR
        POINTER = NO_HD_POINTER

    print('current_player_addr0 :%x' % (POINTER))
    current_player_addr = memory.read_process(process, POINTER, 4)
    print('current_player_addr :%x' % (current_player_addr))
    if not current_player_addr:
        # 游戏还未开始
        GAME_INITED = False
    else:
        playeridx = memory.read_process(process, current_player_addr, 1)
        print('playeridx:', playeridx)
        if 0 <= playeridx <= 7:
            GAME_INITED = True
            GAME_ADDR['player1'] = current_player_addr - (0x0168 * playeridx)
            play1_gold = GAME_ADDR['player1'] + 0xb4
            GAME_ADDR['hero_1'] = GAME_ADDR['player1'] + 0x0b50
            GAME_ADDR['town_1_base'] = GAME_ADDR['hero_1'] - 0x0c
            i = 0
            while i < 8:
                GAME_ADDR['play%d_gold' % (i+1)] = play1_gold + (i * 0x0168)
                i += 1
        for k in GAME_ADDR:
            print(k, hex(GAME_ADDR[k]))

    return GAME_INITED


def get_town_info(process, num):
    """ 获取城镇信息"""
    size = 0x168
    base_addr = memory.read_process(process, GAME_ADDR['town_1_base'], 4)
    addr = base_addr + (size * num)
    buf = memory.read_process(process, addr, size)

    town = Town.from_buffer_copy(buf, 0)
    data = town.to_json()
    if town.name_pointer == 0 or town.name_pointer == 0xFFFFFFFF:
        data['name'] = ''
    else:
        data['name'] = bytes2str(memory.read_process(process, town.name_pointer, 20), 'gbk')
    # file_name = 'town-%d' % (num)
    # print('town_name:', file_name)
    # with open(file_name, 'w') as fp:
    #     i = 0
    #     while i < size:
    #         if (i % 16) == 0:
    #             fp.write('%X: ' % (addr + i))
    #         fp.write("%02x " % (buf[i]))
    #         i += 1
    #         if (i % 16) == 0:
    #             fp.write('\n')
    return data


def list_all_player(process):
    """获取所有玩家信息"""
    buf = memory.read_process(process, GAME_ADDR['player1'], 0x168 * 8)
    i = 0
    data = []
    while i < 8:
        player = Player.from_buffer_copy(buf, 0x168 * i)
        i += 1
        data.append(player.to_json())
    return data


# ===================修改游戏=====================
def set_hero_info(process, num, offset, value, size):
    """修改英雄属性"""
    addr = GAME_ADDR['hero_1'] + (0x0492 * num) + offset
    memory.write_process(process, addr, value, size)


def learn_all_magic(process, num):
    """学会所有魔法"""
    hero_addr = GAME_ADDR['hero_1'] + (0x0492 * num)
    memory.write_process(process, hero_addr + 0x1B5, 0, 4)      # 魔法书
    # 70项魔法，前70个字节记录已学会的。后70个字节记录可以使用的。
    memory.write_process(process, hero_addr + 0x430 - 70, b'\x01' * 140, 140)      # 70种魔法


def set_resources(process, player, data):
    """修改玩家资源"""
    addr = GAME_ADDR['play1_gold'] + (0x0168 * player) - (0x04 * 6)
    data = data[0:7]
    data = data + [0] * (7 - len(data))     # 7项资源数据
    value = ints2bytes(data, 4, True)
    memory.write_process(process, addr, value, 4*7)


def set_town_info(process, num, offset, value, size):
    """修改城镇属性"""
    town_size = 0x168
    base_addr = memory.read_process(process, GAME_ADDR['town_1_base'], 4)
    addr = base_addr + (town_size * num) + offset
    memory.write_process(process, addr, value, size)


def main():
    pid = 1468

    process = memory.inject_process(pid)
    if not process:
        return

    init_game_base_addr(process, True)

    # for hero in list_all_hero(process):
    #     print(hero['num'], hex(hero['addr']), hero['name'], hero['player'])

    # learn_all_magic(process, 0)
    # print(get_current_play(process))
    # info = get_town_info(process, 0)
    # print(info)
    # players = list_all_player(process)
    # for player in players:
    #     print('playeridx:', player['playeridx'])
    #     print('curtown:', player['curtown'])
    #     print('towns:', player['towns'])
    #     print('name:', player['name'])

    memory.close_process(process)


if __name__ == '__main__':
    main()
