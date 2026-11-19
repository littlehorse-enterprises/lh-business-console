# LittleHorse UserTasks Bridge API Client

A lightweight client for interacting with LittleHorse [UserTasks Bridge Backend](https://littlehorse.io/docs/user-tasks-bridge/backend).

## Installation

```bash
npm install @littlehorse-enterprises/user-tasks-bridge-api-client
```

## Documentation

Visit our [official documentation](https://littlehorse.io/docs/integrations/user-tasks-bridge/developer-guide/using-api-client/reference).

## License

SSPLv1 - See [LICENSE](LICENSE.md) for details.

## Struct-backed tasks

Task details now expose `resultStructDefId`, `structDefs`, and `output`.
`completeUserTask(params, { output })` and the new
`saveUserTaskProgress(params, { output })` accept LittleHorse VariableValue
protobuf JSON. INT values must be decimal strings. Legacy field/result payloads
are no longer supported. See the [API migration guide](../docs/struct-backed-user-tasks-api.md)
for the complete HTTP contract and examples.
