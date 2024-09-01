<?php

namespace App\Controller;

use App\Model\RegisterUserDto;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

class RegisterUserController extends AbstractController
{
    #[Route('/register', name: 'app_register', format: 'json', methods: ['POST'])]
    public function index(
        #[MapRequestPayload] RegisterUserDto $registerUserDto,
        UserPasswordHasherInterface $userPasswordHasher,
        EntityManagerInterface $entityManager,
        JWTTokenManagerInterface $JWTManager
    ): JsonResponse {

        $user = new User();
        $user->setEmail($registerUserDto->email);
        $user->setPassword(
            $userPasswordHasher->hashPassword(
                $user,
                $registerUserDto->password
            )
        );

        $entityManager->persist($user);
        $entityManager->flush();

        $token = $JWTManager->create($user);
        return $this->json([
            'token' => $token,
        ]);
    }
}
