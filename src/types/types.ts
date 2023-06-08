import { Vector3 } from "@react-three/fiber";

export interface Entity3DDetails {
    id: string;
    type: Entity3DType;
    position: Vector3 | [number, number, number];
    rotation: Vector3 | [number, number, number];
    scale: Vector3 | [number, number, number];
    animations: AnimationTypes[];
    color: string;
}

export enum Entity3DType {
    Cube = "cube",
    Sphere = "sphere",
    Plane = "plane",
    Cylinder = "cylinder",
    Torus = "torus",
    Cone = "cone",
}


export interface CommandProps {
    command: string
    general_label: GeneralLabels
    specific_label: string
    value: number
    color?: [
        number,
        number,
        number
    ]
}
export enum AnimationTypes {
    Jump = "jump",
    Spin = "spin",
}
export enum GeneralLabels {
    Add = "add",
    Remove = "remove",
    Move = "move",
    Scale = "scale",
    Color = "color",
    Animate = "animate",
    Rotate = "rotate",
    StartAnimation = "start_animation",
    StopAnimation = "stop_animation",
}

export enum AddActions {
    AddCube = "add_cube",
    AddSphere = "add_sphere",
    AddPlane = "add_plane",
    AddCylinder = "add_cylinder",
    AddTorus = "add_torus",
    AddCone = "add_cone",
    AddPyramid = "add_pyramid",
}
