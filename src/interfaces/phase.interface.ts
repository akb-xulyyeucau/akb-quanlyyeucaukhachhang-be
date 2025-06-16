export interface IPhase {
    projectId: string,
    name : string, // tên giai đoạn trong dự án
    phases : Array<IPhaseItem>
}

export interface IPhaseItem {
    name: string,
    order: number,
    description: string,
}