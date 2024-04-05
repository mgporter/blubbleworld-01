# Blubble's World
## World builder for a future math app!

Blubble's World is currently in development. It is meant as a future tool to help build math skills in elementary-aged children by asking them mathematical questions about the world they are building and changing. Right now, this app is just a demo to show what that world could look like.

Enable math practice mode in the options menu. This mode asks questions after placement of a building.

You can also change and regenerate the world as you like. Note that all buildings and markers will be lost when changing the world in this way.

## Technologies

- Built on React and Three.js with typescript.
- Object-oriented design: streamlined selection and building placement system allows easy editing and changing of building properties. For example, building max height, what part of the landscape it can be placed at, etc can all be changed with just one variable.
- Uses Three.js InstancedMesh class to create landscapes that render efficiently and quickly, which is combined with custom objects to hold the state (selected / hovered / etc..) of each instance.
- Converts mouse coordinates to 3d world coordinates and vice versa in order to properly align elements between the canvas layer and HTML overlay (for example, the marker system and selection system).