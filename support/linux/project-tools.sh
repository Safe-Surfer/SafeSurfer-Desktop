#!/bin/bash

function findInFiles() {
# find a string in all files in pwd
find . -type f -print0 | xargs -0 grep "$@"
}