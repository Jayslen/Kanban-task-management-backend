export function parseColumns(input: { id?: string, name?: string }[]) {
    const { toAdd, toDelete, toUpdate } = input ? input.reduce(
        (acc, task) => {
            if (task.id !== undefined && task.name === undefined) {
                acc.toDelete.push({ id: task.id });
            } else if (task.id === undefined && task.name !== undefined) {
                acc.toAdd.push({ name: task.name });
            } else if (task.id !== undefined && task.name !== undefined) {
                acc.toUpdate.push({ id: task.id, name: task.name });
            }
            return acc;
        },
        {
            toAdd: [] as { name: string }[],
            toDelete: [] as { id: string }[],
            toUpdate: [] as { id: string; name: string }[],
        }
    ) : { toAdd: [], toDelete: [], toUpdate: [] }

    return { toAdd, toDelete, toUpdate }
}