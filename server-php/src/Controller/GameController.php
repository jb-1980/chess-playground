<?php

namespace App\Controller;

use App\Model\NewGameDto;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Game;
use App\Entity\User;

class GameController extends AbstractController
{
    #[Route('/api/game/start', name: 'app_game_start', methods: ['POST'])]
    public function index(
        #[MapRequestPayload] NewGameDto $newGameDto,
        EntityManagerInterface $entityManager,
    ): JsonResponse {

        $game = new Game();
        $darkUser = $entityManager->getRepository(User::class)->findOneById($newGameDto->darkPlayerId);
        $lightUser = $entityManager->getRepository(User::class)->findOneById($newGameDto->lightPlayerId);


        $game->setDarkUser($darkUser);
        $game->setLightUser($lightUser);

        $entityManager->persist($game);
        $entityManager->flush();

        return $this->json([
            'gameId' => $game->getId(),
        ]);
    }
}
