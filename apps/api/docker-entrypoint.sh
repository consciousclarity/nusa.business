#!/bin/sh
set -e
if [ ! -f "$NUSA_DATA_DIR/store.json" ]; then
  echo "Seeding API data into $NUSA_DATA_DIR ..."
  node --input-type=module -e "
    import { resetSeed } from './packages/db/dist/repository.js';
    resetSeed();
    console.log('Seed complete');
  "
fi
exec node apps/api/dist/index.js
