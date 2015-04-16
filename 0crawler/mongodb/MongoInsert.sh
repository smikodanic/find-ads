#!/bin/bash

mongo <<EOF
use my_db
db.user.insert({"varw" : "Neki tekst"})
EOF