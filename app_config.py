#!/usr/bin/env python

"""
Project-wide application configuration.

DO NOT STORE SECRETS, PASSWORDS, ETC. IN THIS FILE.
They will be exposed to users. Use environment variables instead.
See get_secrets() below for a fast way to access them.
"""

import os

"""
NAMES
"""
# Project name to be used in urls
# Use dashes, not underscores!
PROJECT_SLUG = 'lookatthis'

# Project name to be used in file paths
PROJECT_FILENAME = 'lookatthis'

# The name of the repository containing the source
REPOSITORY_NAME = 'lookatthis'
REPOSITORY_URL = 'git@github.com:nprapps/%s.git' % REPOSITORY_NAME
REPOSITORY_ALT_URL = None # 'git@bitbucket.org:nprapps/%s.git' % REPOSITORY_NAME'

# Project name used for assets rig
# Should stay the same, even if PROJECT_SLUG changes
ASSETS_SLUG = 'lookatthis'

POST_PATH = 'posts'

"""
DEPLOYMENT
"""
PRODUCTION_S3_BUCKETS = ['apps.npr.org', 'apps2.npr.org']
STAGING_S3_BUCKETS = ['stage-apps.npr.org']
ASSETS_S3_BUCKET = 'assets.apps.npr.org'

PRODUCTION_SERVERS = ['cron.nprapps.org']
STAGING_SERVERS = ['50.112.92.131']

# These variables will be set at runtime. See configure_targets() below
S3_BUCKETS = []
S3_BASE_URL = ''
DEBUG = True

"""
COPY EDITING
"""
COPY_GOOGLE_DOC_KEY = '0AlXMOHKxzQVRdHZuX1UycXplRlBfLVB0UVNldHJYZmc'
COPY_PATH = 'data/copy.xlsx'

"""
SHARING
"""
SHARE_URL = 'http://%s/%s/' % (PRODUCTION_S3_BUCKETS[0], PROJECT_SLUG)

"""
ADS
"""

NPR_DFP = {
    'STORY_ID': '1002',
    'TARGET': 'homepage',
    'ENVIRONMENT': 'NPRTEST',
    'TESTSERVER': 'false'
}

"""
SERVICES
"""
GOOGLE_ANALYTICS = {
    'ACCOUNT_ID': 'UA-5828686-4',
    'DOMAIN': PRODUCTION_S3_BUCKETS[0],
    'TOPICS': '' # e.g. '[1014,3,1003,1002,1001]'
}

DISQUS_UUID = 'e90a2863-0148-11e4-93ac-14109fed4b76'

"""
Utilities
"""
def get_secrets():
    """
    A method for accessing our secrets.
    """
    secrets = [
        'TUMBLR_CONSUMER_KEY',
        'TUMBLR_CONSUMER_SECRET',
        'TUMBLR_TOKEN',
        'TUMBLR_TOKEN_SECRET'
    ]

    secrets_dict = {}

    for secret in secrets:
        name = '%s_%s' % (PROJECT_FILENAME, secret)
        secrets_dict[secret] = os.environ.get(name, None)

    return secrets_dict

def configure_targets(deployment_target):
    """
    Configure deployment targets. Abstracted so this can be
    overriden for rendering before deployment.
    """
    global S3_BUCKETS
    global S3_BASE_URL
    global DEBUG
    global DEPLOYMENT_TARGET
    global APP_LOG_PATH
    global DISQUS_SHORTNAME
    global TUMBLR_NAME


    if deployment_target == 'production':
        S3_BUCKETS = PRODUCTION_S3_BUCKETS
        S3_BASE_URL = 'http://%s/%s' % (S3_BUCKETS[0], PROJECT_SLUG)
        DISQUS_SHORTNAME = 'npr-news'
        DEBUG = False
        TUMBLR_NAME = 'nprlookatthis'
    elif deployment_target == 'staging':
        S3_BUCKETS = STAGING_S3_BUCKETS
        S3_BASE_URL = 'http://127.0.0.1:8000'
        DISQUS_SHORTNAME = 'nprviz-test'
        DEBUG = True
        TUMBLR_NAME = 'stage-lookatthis'
    else:
        S3_BUCKETS = []
        S3_BASE_URL = 'http://127.0.0.1:8000'
        DISQUS_SHORTNAME = 'nprviz-test'
        DEBUG = True
        APP_LOG_PATH = '/tmp/%s.app.log' % PROJECT_SLUG
        TUMBLR_NAME = 'stage-lookatthis'


    DEPLOYMENT_TARGET = deployment_target

"""
Run automated configuration
"""
DEPLOYMENT_TARGET = os.environ.get('DEPLOYMENT_TARGET', None)

configure_targets(DEPLOYMENT_TARGET)

