import sys
import os

# Tell Python to look inside the src directory for the spike package
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "src")))

from spike.app import create_app

app = create_app()
