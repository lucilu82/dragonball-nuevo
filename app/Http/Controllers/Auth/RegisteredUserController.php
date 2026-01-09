<?php

namespace App\Http\Controllers\Auth;

class RegisteredUserController extends \App\Http\Controllers\Controller
{
    public function create()
    {
        return \view('auth.register');
    }

    public function store($request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = \App\Models\User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
        ]);

        \auth()->login($user);

        return \redirect()->route('home')->with('status', '¡Registro exitoso! Bienvenido.');
    }
}

