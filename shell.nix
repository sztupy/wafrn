{
  pkgs ? import <nixpkgs> { },
}:

pkgs.mkShell {
  buildInputs = with pkgs; [ nodejs_24 jq ];
  shellHook = "echo \"Use \"npm run frontend:develop:prod\" to start the development server, make sure to clear your cache if you run a switch servers!\"";
}
