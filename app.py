#!/usr/bin/env python
# encoding: utf-8

import json
import os
import time
import bottle
import h3
import log
import memory

DEBUG = bool(os.environ.get('DEBUG'))
bottle.debug(DEBUG)

PID = None          # 当前游戏进程ID
PROCESS = None      # 当前游戏进程句柄
IS_HD = None

VERSION = '20230422'


def render_json(data, status=200):
    bottle.response.status = status
    bottle.response.content_type = 'application/json'
    return json.dumps(data)

@bottle.route('/')
def index():
    roundKey = time.time() if DEBUG else VERSION
    return bottle.template('index', **{'DEBUG': DEBUG, 'roundKey': roundKey, 'VERSION': VERSION})

@bottle.route('/static/<path:path>')
def callback(path):
    return bottle.static_file(path, root='./static')


def init_game_info(pid, is_hd):
    global PID
    global PROCESS
    global IS_HD

    if not pid:
        h3.GAME_INITED = False
        return render_json({'error': '游戏未运行', 'error_no': 0}, 500)

    if pid != PID:
        PID = pid
        if PROCESS:
            try:
                memory.close_process(PROCESS)
            except Exception:
                pass
            PROCESS = None
    if not PROCESS:
        h3.GAME_INITED = False
        PROCESS = memory.inject_process(PID)

    if not PROCESS:
        PID = None
        h3.GAME_INITED = False
        return render_json({'error': '游戏未运行', 'error_no': 0}, 500)

    IS_HD = is_hd
    if not h3.GAME_INITED:
        log.debug('init_game_base_addr: %d %s' % (PROCESS, IS_HD))
        try:
            h3.init_game_base_addr(PROCESS, IS_HD)
        except Exception:
            PID = None
            PROCESS = None
            IS_HD = None
            return render_json({'error': '游戏未运行', 'error_no': 0}, 500)

    if not h3.GAME_INITED:
        return render_json({'status': False, 'pid': PID, 'hd': IS_HD, 'players': []}, 200)

    try:
        players = h3.list_all_player(PROCESS)
    except Exception:
        PID = None
        PROCESS = None
        IS_HD = None
        h3.GAME_INITED = False
        return render_json({'error': '游戏未运行', 'error_no': 0}, 500)

    data = {
        'status': True,
        'pid': PID,
        'hd': IS_HD,
        'players': players,
    }

    return render_json(data)



@bottle.get('/api/v1/game_info')
def get_game_info():
    global PID
    global PROCESS
    global IS_HD

    if not PID:
        processes = memory.list_process()
        pid = None
        for name in processes:
            if name.startswith(b'Heroes3') and name.endswith(b'.exe'):
                pid = processes[name]
                IS_HD = name.endswith(b'HD.exe')
                break
        if pid:
            PID = pid
            PROCESS = memory.inject_process(PID)

    return init_game_info(PID, IS_HD)


@bottle.put('/api/v1/game_info')
def put_game_info():
    pid = bottle.request.json['pid']
    hd = bottle.request.json['hd']
    return init_game_info(pid, hd)


# 获取/修改资源
@bottle.get('/api/v1/resources')
def index_resources():
    return render_json(h3.get_all_resources(PROCESS))


@bottle.put('/api/v1/resources')
def update_resources():
    player = bottle.request.json['player']
    data = bottle.request.json['data']
    h3.set_resources(PROCESS, player, data)
    return render_json(h3.get_all_resources(PROCESS))


# 获取/修改英雄数据
@bottle.get('/api/v1/heroes')
def index_heoro():
    return render_json(h3.list_all_hero(PROCESS))


@bottle.get('/api/v1/heroes/:num')
def show_hero(num):
    return render_json(h3.get_hero_info(PROCESS, int(num)))


@bottle.put('/api/v1/heroes/:num')
def update_hero(num):
    num = int(num)
    data = bottle.request.json['data']
    for item in data:
        h3.set_hero_info(PROCESS, num, item['offset'], item['value'], item['size'])
    return render_json(h3.get_hero_info(PROCESS, num))


@bottle.put('/api/v1/heroes/:num/magic')
def learn_all_magic(num):
    num = int(num)
    h3.learn_all_magic(PROCESS, num)
    return render_json(h3.get_hero_info(PROCESS, num))


@bottle.get('/api/v1/towns')
def index_town():
    data = []
    ids = bottle.request.query.getlist('ids[]')
    for idx in ids:
        data.append(h3.get_town_info(PROCESS, int(idx)))
    return render_json(data)


@bottle.get('/api/v1/towns/:num')
def show_town(num):
    return render_json(h3.get_town_info(PROCESS, int(num)))


@bottle.put('/api/v1/towns/:num')
def update_town(num):
    num = int(num)
    data = bottle.request.json['data']
    for item in data:
        h3.set_town_info(PROCESS, num, item['offset'], item['value'], item['size'])
    return render_json(h3.get_town_info(PROCESS, num))


if __name__ == '__main__':
    print('start with debug:', DEBUG)
    log.set_level(DEBUG)
    bottle.run(host='0.0.0.0', port='9090', debug=True, reloader=DEBUG)
