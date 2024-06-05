#! /bin/bash

# FULL_VERSION="v1.2.3-beta.4"

function parse () {
    local FULL_VERSION=$1
    VERSION="${FULL_VERSION#v}"

    # Split version into parts
    IFS='.' read -r MAJOR MINOR PATCH <<< "$VERSION"

    # Check if PATCH contains prerelease info and extract it
    if [[ "$PATCH" == *-* ]]; then
        PRERELEASE=$(echo "$PATCH" | cut -d- -f2 | cut -d. -f1)
        PATCH=$(echo "$PATCH" | cut -d- -f1)
    fi

    echo "--------------------"
    echo "Ful :       $FULL_VERSION"
    echo "Major:      $MAJOR"
    echo "Minor:      $MINOR"
    echo "Patch:      $PATCH"
    echo "Prerelease: $PRERELEASE"
    echo "--------------------"
    echo ""
}

parse "v1.2.3-beta.4"
parse "v2.2.3"
parse "v3.2"
parse "v4"
parse "v5.2.3-beta"
parse "v6.2.3-beta.4+build.5"

