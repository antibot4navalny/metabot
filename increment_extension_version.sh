	## increment the rightmost component of version (assuming there is has at least two components)
	next_version="${version%.*}.$((${version##*.}+1))"
	echo $next_version > next_version.txt
	
