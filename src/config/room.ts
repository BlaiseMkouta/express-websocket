export interface PublicRoom {
  id: string;
  name: string;
  description: string;
}

// Identifiants FIXES : ils doivent rester les memes a chaque redemarrage,
// sinon les messages en base pointeraient vers des salons qui n'existent plus.
// (Room.id est en VarChar(30) : un UUID de 36 caracteres ne rentrerait pas.)
export const ROOMS: PublicRoom[] = [
  {
    id: "general",
    name: "General",
    description: "faites ce que vous voulez",
  },
  {
    id: "dev",
    name: "dev",
    description: "amusez vous update",
  },
  {
    id: "room2",
    name: "room2",
    description: "ici c'est la room 2",
  },
];
