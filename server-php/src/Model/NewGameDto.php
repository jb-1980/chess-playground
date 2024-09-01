<?php

namespace App\Model;

use Symfony\Component\Validator\Constraints as Assert;

class NewGameDto
{
    public function __construct(
        #[Assert\NotBlank]
        public readonly int $lightPlayerId,
        #[Assert\NotBlank]
        public readonly int $darkPlayerId
    ) {
    }
}
