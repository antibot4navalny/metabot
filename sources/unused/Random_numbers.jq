# 15-bit integers generated using the same formula as rand() from the Microsoft C Runtime.
# The random numbers are in [0 -- 32767] inclusive.
# Input: an array of length at least 2 interpreted as [count, state, ...]
# Output: [count+1, newstate, r] where r is the next pseudo-random number.
def next_rand_Microsoft:
  .[0] as $count | .[1] as $state
  | ( (214013 * $state) + 2531011) % 2147483648 # mod 2^31
  | [$count+1 , ., (. / 65536 | floor) ] ;
  
  # Generate a single number following the normal distribution with mean 0, variance 1,
# using the Box-Muller method: X = sqrt(-2 ln U) * cos(2 pi V) where U and V are uniform on [0,1].
# Input: [n, state]
# Output [n+1, nextstate, r]
def next_rand_normal:
  def u: next_rand_Microsoft | .[2] /= 32767; 
  u as $u1
  | ($u1 | u) as $u2
  | ((( (8*(1|atan)) * $u1[2]) | cos)
     * ((-2 * (($u2[2]) | log)) | sqrt)) as $r
  | [ (.[0]+1), $u2[1], $r] ;
 
# Generate "count" arrays, each containing a random normal variate with the given mean and standard deviation.
# Input: [count, state]
# Output: [updatedcount, updatedstate, rnv]
# where "state" is a seed and "updatedstate" can be used as a seed.
def random_normal_variate(mean; sd; count):
  next_rand_normal
  | recurse( if .[0] < count then next_rand_normal else empty end)
  | .[2] = (.[2] * sd) + mean;
  
def summary:
  length as $l | add as $sum | ($sum/$l) as $a
  | reduce .[] as $x (0; . + ( ($x - $a) | .*. ))
  | [ $a, (./$l | sqrt)] ;
 
[ [0,1] | random_normal_variate(1; 0.5; 1000) | .[2] ] | summary
  