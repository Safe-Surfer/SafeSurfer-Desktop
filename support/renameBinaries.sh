#!/bin/bash -x

# SafeSurfer-Desktop - renameBinaries.sh (support file)

#
# Copyright (C) 2018 Caleb Woodbine <info@safesurfer.co.nz>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.
#

#
# Correct the names of various binary files
#

inFile="$1"

if [ -z "$inFile" ]
then
	echo "Please provide a filename."
	exit 1
fi

if [ ! -f "$inFile" ]
then
	echo "File doesn't exist."
	exit 1
fi

currentVersion="$(jq -r '.version' package.json)"
currentBuild="$(jq -r '.APPBUILD' package.json)"

inFileBaseName=$(basename "$inFile")
inFileDirName=$(dirname "$inFile")

case "$inFileBaseName" in
	Safe_Surfer-x86_64.AppImage)
		mv "$inFile" "$inFileDirName/SafeSurfer-Desktop-x86_64-${currentVersion}-${currentBuild}.AppImage" || echo "Unable to rename AppImage."
	;;

	SafeSurfer-Desktop-Linux.zip)
		mv "$inFile" "$inFileDirName/SafeSurfer-Desktop-${currentVersion}-${currentBuild}-linux.zip" || echo "Unable to rename zip."
	;;

	SafeSurfer-Desktop-*-mac.zip)
		mv "$inFile" "$inFileDirName/SafeSurfer-Desktop-${currentVersion}-${currentBuild}-mac.zip" || echo "Unable to rename macOS zip."
	;;

	SafeSurfer-Desktop\ *.exe)
		mv "$inFile" "$inFileDirName/SafeSurfer-Desktop-${currentVersion}-${currentBuild}.exe" || echo "Unable to rename Windows exe."
	;;

	*)
		echo "File given isn't applicable. Ignoring..."
	;;
esac