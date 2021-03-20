#!/usr/bin/env python
# encoding: utf-8

import logging
import sys

logger = logging.Logger('')
handler = logging.StreamHandler(sys.stdout)
handler.setLevel(logging.INFO)
logger.addHandler(handler)


def info(log):
    logger.info(log)


def debug(log):
    logger.debug(log)
