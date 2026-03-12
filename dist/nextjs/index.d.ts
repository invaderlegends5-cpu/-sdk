import { NextRequest, NextResponse } from 'next/server';
import { CoreIAM } from '../core';
export declare class NextHandlers {
    private iam;
    constructor(iam: CoreIAM);
    handleProxy(req: NextRequest, path: string): Promise<NextResponse<any>>;
}
