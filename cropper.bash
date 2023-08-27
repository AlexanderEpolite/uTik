#!/usr/bin/env bash

ffmpeg -i /tmp/${1}.mp4 -t 1 -vf cropdetect -f null - | awk '/crop/ { print $NF }' | tail -1
