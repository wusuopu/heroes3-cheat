#!/usr/bin/env python
# encoding: utf-8

import base64
import os


BASE_DIR = os.path.realpath(os.path.join(__file__, '..', 'static'))
IMAGE_DIR = os.path.join(BASE_DIR, 'image')
CSS_DIR = os.path.join(BASE_DIR, 'css')
JS_DIR = os.path.join(BASE_DIR, 'js')


def convert_image_to_base64():
    fp = open(os.path.join(CSS_DIR, 'icon.css'), 'w')
    image_folders = os.listdir(IMAGE_DIR)
    for image_category in image_folders:
        folder = os.path.join(IMAGE_DIR, image_category)
        if not os.path.isdir(folder):
            continue
        files = os.listdir(folder)
        files.sort()
        for f in files:
            name, ext = os.path.splitext(f)
            if ext not in ['.gif', '.jpg', '.jpeg', '.bmp']:
                # 图片文件
                continue
            print(image_category, f)
            file_type = 'data:image/%s;base64,' % (ext[1:])
            with open(os.path.join(folder, f), 'rb') as fp1:
                data = fp1.read()
                url = base64.b64encode(data).decode('utf8')
            fp.write(".icon-%s-%s {\n  background-image: url(%s%s);\n}\n" % (image_category, name, file_type, url))

    fp.close()


def bundle_assets():
    with open(os.path.join(CSS_DIR, 'bundle.css'), 'w') as out:
        out.write('/*icon image*/\n')
        with open(os.path.join(CSS_DIR, 'icon.css'), 'r') as fp:
            out.write(fp.read())
        out.write('/*==========================*/\n')
        with open(os.path.join(CSS_DIR, 'main.css'), 'r') as fp:
            out.write(fp.read())

    js_files = [
        'modernizr.js', 'bluebird.core.min.js',
        'lodash.min.js', 'axios.min.js',
        'babel.6.15.min.js',
        'react.16.production.min.js',
        'react-dom.16.production.min.js',
    ]
    with open(os.path.join(JS_DIR, 'bundle.js'), 'w') as out:
        for f in js_files:
            print('concat %s' % (f))
            with open(os.path.join(JS_DIR, f), 'r') as fp:
                out.write(fp.read())
                out.write('\n\n//==========\n')


def main():
    convert_image_to_base64()
    bundle_assets()

if __name__ == '__main__':
    main()
