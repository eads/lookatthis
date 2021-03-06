#!/usr/bin/env python

import json

from flask import Blueprint

from render_utils import flatten_app_config, flatten_post_config
import static

post = Blueprint('post', __name__, url_prefix='/posts')

# Render LESS files on-demand
@post.route('/<string:slug>/less/<string:filename>')
def _post_less(slug, filename):
    return static.less('posts/%s' % slug, filename)

# Render post_config.js
@post.route('/<string:slug>/js/app_config.js')
def _app_config_js(slug):
    config = flatten_app_config()
    config.update(flatten_post_config(slug))
    js = 'window.APP_CONFIG = ' + json.dumps(config)

    return js, 200, { 'Content-Type': 'application/javascript' }

# render copytext
@post.route('/<string:slug>/js/copy.js')
def _copy_js(slug):
    return static.copy_js(slug)

# serve arbitrary static files on-demand
@post.route('/<string:slug>/<path:path>')
def _post_static(slug, path):
    return static.static_file('posts/%s' % slug, path)
