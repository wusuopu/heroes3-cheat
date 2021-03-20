#!/usr/bin/env python
# encoding: utf-8

import os
import bottle
import h3

# DEBUG = bool(os.environ.get('DEBUG'))
DEBUG = True
bottle.debug(DEBUG)


@bottle.route('/')
def index():
    return bottle.template('index')

@bottle.route('/static/<path:path>')
def callback(path):
    return bottle.static_file(path, root='./static')


if __name__ == '__main__':
    bottle.run(host='0.0.0.0', port='9090', debug=True, reloader=DEBUG)
