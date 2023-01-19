git pull origin master
composer i
php artisan migrate
php artisan optimize
php artisan view:cache
npx mix --production
