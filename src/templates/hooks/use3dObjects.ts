import { useState } from "react"
import { AddActions, CommandProps, Entity3DDetails, Entity3DType } from "../../types/types"
import { v4 as uuidv4 } from 'uuid'
import { Vector3 } from "three"

const getRandomPosition = () => {
    const maxRadius = 3
    const randomRadius = Math.random() * maxRadius
    const randomVec = new Vector3()
    randomVec.randomDirection()
    randomVec.multiplyScalar(randomRadius)
    randomVec.y += 1.5

    return [randomVec.x, randomVec.y, randomVec.z]
}

const randomScales = () => {
    const min = 0.5
    const max = 1.5
    const scale = Math.random() * (max - min) + min

    return [scale, scale, scale]
}
const getRandomRotation = () => {
    const randomX = Math.random() * 2 * Math.PI;
    const randomY = Math.random() * 2 * Math.PI;
    const randomZ = Math.random() * 2 * Math.PI;

    return [randomX, randomY, randomZ];
}
const use3dObjects = (cameraRef) => {
    const [objects, setObjects] = useState<Entity3DDetails[]>([])
    const [activeObjectId, setActiveObjectId] = useState('')

    const onClickObject = (id: string) => {
        if (activeObjectId === id) {
            setActiveObjectId('')
            return
        }
        setActiveObjectId(id)
    }

    const processAddAction = ({ specific_label, value, color }: Partial<CommandProps>) => {
        let count = !value ? 1 : value
        const newObjects = []
        for (let i = 0; i < count; i++) {
            const newObject = {
                id: uuidv4(),
                type: addActionToObjectTypes[specific_label],
                position: getRandomPosition(),
                scale: randomScales(),
                color: 'rgb(' + color.join() + ')',
                rotation: getRandomRotation(),
                animations: []
            } as Entity3DDetails
            newObjects.push(newObject)
        }
        setObjects([...objects, ...newObjects])
        return true;
    }

    const processRemoveAction = () => {
        if (!activeObjectId) return false;
        const newObjects = objects.filter((obj) => obj.id !== activeObjectId)
        setObjects(newObjects);
        return true;
    }

    const processColorAction = (command: CommandProps) => {
        if (!activeObjectId) return false;
        const newObjects = objects.map((obj) => {
            if (obj.id !== activeObjectId) return obj
            return { ...obj, color: 'rgb(' + command.color.join() + ')' }
        })
        setObjects(newObjects)
        return true;
    }

    const processScaleAction = (command: CommandProps) => {
        if (!activeObjectId) return false;
        let scaleFactor = command.value ? command.value : 2;
        scaleFactor = command.specific_label === 'scale_up' ? scaleFactor : 1 / scaleFactor;
        const newObjects = objects.map((obj) => {
            if (obj.id !== activeObjectId) return obj
            return { ...obj, scale: obj.scale.map((s) => s * scaleFactor) }
        })
        setObjects(newObjects)
        return true;
    }

    const processMoveAction = (command: CommandProps) => {
        if (!activeObjectId) return false;
        console.log("camera ref", cameraRef.current);
        const delta = command.value ? command.value : 0.5;
        let deltaVector = [0, 0, 0];
        switch (command.specific_label) {
            case 'move_away':
                let deltaVectorMoveAway3 = new Vector3(0, 0, delta);
                deltaVectorMoveAway3.applyQuaternion(cameraRef.current.quaternion);
                deltaVector = [deltaVectorMoveAway3.x, deltaVectorMoveAway3.y, deltaVectorMoveAway3.z];
                break;
            case 'move_backward':
                deltaVector = [0, 0, -delta];
                break;
            case 'move_closer':
                let deltaVectorMoveCloser3 = new Vector3(0, 0, delta);
                deltaVectorMoveCloser3.applyQuaternion(cameraRef.current.quaternion);
                deltaVector = [deltaVectorMoveCloser3.x, deltaVectorMoveCloser3.y, deltaVectorMoveCloser3.z];
                break;
            case 'move_down':
                deltaVector = [0, -delta, 0];
                break;
            case 'move_forward':
                deltaVector = [0, 0, delta];
                break;
            case 'move_left':
                deltaVector = [-delta, 0, 0];
                break;
            case 'move_right':
                deltaVector = [delta, 0, 0];
                break;
            case 'move_up':
                deltaVector = [0, delta, 0];
                break;

            default:
                return false;
        }

        console.log("delta vector", deltaVector);


        const newObjects = objects.map((obj) => {
            if (obj.id !== activeObjectId) return obj
            console.log(obj);
            return { ...obj, position: obj.position.map((p, i) => p + deltaVector[i]) }
        })
        setObjects(newObjects)

        return true;
    }

    const processRotateAction = (command: CommandProps) => {
        console.log(activeObjectId);
        if (!activeObjectId) return false;
        let deltaDegrees = command.value ? command.value : 90;
        let deltaRadians = deltaDegrees * (Math.PI / 180); // Convert degrees to radians
        deltaRadians *= command.specific_label === 'rotate_clockwise' ? 1 : -1;
        console.log("delta radians", deltaRadians);
        const newObjects = objects.map((obj) => {
            if (obj.id !== activeObjectId) return obj
            return { ...obj, rotation: [obj.rotation[0], obj.rotation[1] + deltaRadians, obj.rotation[2]] }
        })
        setObjects(newObjects)
        return true;
    }

    const processAnimateAction = (command: CommandProps) => {
        if (!activeObjectId) return false;
        const newObjects = objects.map((obj) => {
            if (obj.id !== activeObjectId) return obj
            if (command.general_label === 'start_animation') {
                return { ...obj, animations: [...obj.animations, command.specific_label] }
            }
            return { ...obj, animations: [] }
        }) as Entity3DDetails[]
        setObjects(newObjects)
        return true;
    }

    const addActionToObjectTypes = {
        [AddActions.AddCube]: Entity3DType.Cube,
        [AddActions.AddSphere]: Entity3DType.Sphere,
        [AddActions.AddPlane]: Entity3DType.Plane,
        [AddActions.AddCylinder]: Entity3DType.Cylinder,
        [AddActions.AddTorus]: Entity3DType.Torus,
        [AddActions.AddCone]: Entity3DType.Cone,
        [AddActions.AddPyramid]: Entity3DType.Cone,
    }
    const processCommand = (command: CommandProps): false | string => {
        let hasProcessed = false;
        //nothing to do
        switch (command.general_label) {
            case 'add':
                hasProcessed = processAddAction(command)
                break

            case 'remove':
                hasProcessed = processRemoveAction()
                break

            case 'scale':
                hasProcessed = processScaleAction(command);
                break

            case 'color':
                hasProcessed = processColorAction(command);
                break

            case 'move':
                hasProcessed = processMoveAction(command);
                break

            case 'rotate':
                hasProcessed = processRotateAction(command);
                break
            case 'start_animation':
            case 'stop_animation':
                hasProcessed = processAnimateAction(command);
                break
            default:
                return false;
        }

        return hasProcessed ? generateCommandString(command) : false;
    }

    const moveDirectionToString = (direction: string) => {
        switch (direction) {
            case 'move_away':
                return 'away from you';
            case 'move_backward':
                return 'backward';
            case 'move_closer':
                return 'closer to you';
            case 'move_down':
                return 'down';
            case 'move_forward':
                return 'forward';
            case 'move_left':
                return 'left';
            case 'move_right':
                return 'right';
            case 'move_up':
                return 'up';
            default:
                return '';
        }
    }

    const generateCommandString = (command: CommandProps) => {
        let commandString = '';
        switch (command.general_label) {
            case 'add':
                commandString = `Added ${command.value ? command.value : 1} ${addActionToObjectTypes[command.specific_label]}${command.value > 1 ? 's' : ''}`;
                break
            case 'remove':
                commandString = `Removed selected object`;
                break
            case 'scale':
                commandString = `Scaled ${command.specific_label === "scale_up" ? "up" : "down"} ${command.value ? command.value : 2} times`;
                break
            case 'color':
                commandString = `Changed color`;
                break
            case 'move':
                commandString = `Moved ${moveDirectionToString(command.specific_label)} by ${command.value ? command.value : 0.5} meters`;
                break
            case 'rotate':
                commandString = `Rotated by ${command.value ? command.value : 90} degrees`;
                break
            case 'start_animation':
                commandString = `Started ${command.specific_label}`;
                break
            case 'stop_animation':
                commandString = `Stopped all animations`;
                break
        };
        return commandString;
    }

    return {
        activeObjectId,
        objects,
        processCommand,
        onClickObject,
    }
}

export default use3dObjects