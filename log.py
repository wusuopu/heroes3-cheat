#!/usr/bin/env python
# encoding: utf-8

import logging
import sys

logger = logging.Logger('')
handler = logging.StreamHandler(sys.stdout)
handler.setLevel(logging.INFO)
logger.addHandler(handler)


def set_level(debug):
    if debug:
        handler.setLevel(logging.DEBUG)
    else:
        handler.setLevel(logging.INFO)


def info(log):
    logger.info(log)


def debug(log):
    logger.debug(log)
