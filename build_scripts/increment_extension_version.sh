	. build_scripts/set_version.sh

	## increment the rightmost component of version (assuming there is has at least two components)
	next_version="${version%.*}.$((${version##*.}+1))"
	echo $next_version > assets/next_version.txt
