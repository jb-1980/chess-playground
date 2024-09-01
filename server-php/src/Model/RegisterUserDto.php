<?php

namespace App\Model;

use Symfony\Component\Validator\Constraints as Assert;

class RegisterUserDto
{
    public function __construct(
        #[Assert\NotBlank]
        public readonly string $email,
        #[Assert\NotBlank]
        public readonly string $password
    ) {
    }
}
