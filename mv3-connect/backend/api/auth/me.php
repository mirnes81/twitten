<?php
declare(strict_types=1);
require __DIR__ . '/../../bootstrap.php';

$user = require_user();
respond(['user' => public_user($user)]);
