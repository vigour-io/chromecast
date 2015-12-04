mkdir test/node_modules 2>/dev/null ; ln -s ../../ test/node_modules/$1
if [ -f example ] ; then
  mkdir example/node_modules 2>/dev/null ; ln -s ../../ example/node_modules/$1
fi
