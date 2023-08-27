#!/usr/bin/env bash

ffmpeg -i /tmp/${0} -t 1 -vf cropdetect -f null - | awk '/crop/ { print $NF }' | tail -1
