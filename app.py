#!/usr/bin/env python
# encoding: utf-8

import json
import os
import bottle
import h3
import memory

# DEBUG = bool(os.environ.get('DEBUG'))
DEBUG = True
bottle.debug(DEBUG)

PID = None          # 当前游戏进程ID
PROCESS = None      # 当前游戏进程句柄
IS_HD = None


def render_json(data, status=200):
    bottle.response.status = status
    bottle.response.content_type = 'application/json'
    return json.dumps(data)

@bottle.route('/')
def index():
    return bottle.template('index', **{'DEBUG': DEBUG})

@bottle.route('/static/<path:path>')
def callback(path):
    return bottle.static_file(path, root='./static')


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
        if pid:
            PID = pid
            PROCESS = memory.inject_process(PID)

    if not PID:
        return render_json({'error': '游戏未运行', 'error_no': 0}, 500)

    if not PROCESS:
        PID = None
        return render_json({'error': '游戏未运行', 'error_no': 0}, 500)

    try:
        if IS_HD is None:
            info = h3.get_game_base_addr(PID)
            IS_HD = info.get('HD', None)
    except Exception:
        PID = None
        PROCESS = None
        return render_json({'error': '游戏未运行', 'error_no': 0}, 500)

    try:
        player = h3.get_current_play(PROCESS)
    except Exception:
        PID = None
        PROCESS = None
        IS_HD = None
        return render_json({'error': '游戏未运行', 'error_no': 0}, 500)

    data = {
        'pid': PID,
        'hd': IS_HD,
        'player': player,
    }

    return render_json(data)


# 获取/修改资源
@bottle.get('/api/v1/resoueces')
def get_all_resouces():
    return render_json(h3.get_all_resouces(PROCESS))


@bottle.put('/api/v1/resoueces')
def set_resources():
    player = bottle.request.json['player']
    data = bottle.request.json['data']
    h3.set_resources(PROCESS, player, data)
    return render_json(h3.get_all_resouces(PROCESS))


# 获取/修改英雄数据
@bottle.get('/api/v1/heros')
def get_all_heros():
    return render_json(h3.list_all_hero(PROCESS))


@bottle.get('/api/v1/heros/:num')
def get_all_heros(num):
    return render_json(h3.get_hero_info(PROCESS, int(num)))


@bottle.put('/api/v1/heros/:num')
def get_all_heros(num):
    num = int(num)
    data = bottle.request.json['data']
    for item in data:
        h3.set_hero_info(PROCESS, num, item['offset'], item['value'], item['size'])
    return render_json(h3.get_hero_info(PROCESS, num))


if __name__ == '__main__':
    print('start with debug:', DEBUG)
    bottle.run(host='0.0.0.0', port='9090', debug=True, reloader=DEBUG)
