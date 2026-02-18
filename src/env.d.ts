/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    session: {
      userId: string;
      email: string;
      name: string;
    } | null;
    isAuthenticated: boolean;
  }
}