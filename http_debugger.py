#! /usr/bin/env python
#
# $Id: servehttp,v 1.3 2007/02/03 10:27:01 matthias Exp matthias $
#
# httpserve - Serve a directory using HTTP.
#
# by Matthias Friedrich <matt@mafr.de>
#
# This program is distributed under the Artistic License.
#
import os
import sys
import SimpleHTTPServer
import BaseHTTPServer
from optparse import OptionParser

port = 8000

parser = OptionParser()
parser.set_usage('%prog [options] directory')
parser.add_option('-p', '--port', dest = 'port', help = 'the port to listen on')
(options, args) = parser.parse_args()

if len(args) != 1:
	parser.print_help()
	sys.exit(1)

try:
	os.chdir(args[0])
except OSError:
	parser.error("Can't change to directory `%s'" % args[0])


if options.port:
	try:
		port = int(options.port)
		if not ( 0 < port < 65536 ):
			raise ValueError()
	except ValueError:
		parser.error('port number has to be numeric (1-65535)')
		sys.exit(1)


handler = SimpleHTTPServer.SimpleHTTPRequestHandler
httpd = BaseHTTPServer.HTTPServer(('', port), handler)

print "Serving directory '%s' on port %d" % (os.getcwd(), port)


try:
	httpd.serve_forever()
except KeyboardInterrupt:
	print 'Server killed on user request (keyboard interrupt).'

# EOF
