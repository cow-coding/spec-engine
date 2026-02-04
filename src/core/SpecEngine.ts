import { SpecEngineState } from '../types';

// ===========================================================
// SpecEngine: 비즈니스 로직 계산 엔진
// ===========================================================

export class SpecEngine {
    public state: SpecEngineState = {};
    private context: any = {};

    constructor() {
        const baseFunctions: any = {
            sum: (arr: any) => (Array.isArray(arr) ? arr.reduce((a, b) => a + b, 0) : 0),
            avg: (arr: any) => (Array.isArray(arr) ? arr.reduce((a, b) => a + b, 0) / arr.length : 0),
            max: (arr: any) => Math.max(...arr),
            min: (arr: any) => Math.min(...arr),
            count: (arr: any) => (Array.isArray(arr) ? arr.length : 0),
            filter: (arr: any, predicate: any) => (Array.isArray(arr) ? arr.filter(predicate) : []),
            map: (arr: any, mapper: any) => (Array.isArray(arr) ? arr.map(mapper) : []),
        };

        // 대소문자 모두 지원
        Object.entries(baseFunctions).forEach(([name, func]) => {
            this.context[name] = func;
            this.context[name.toUpperCase()] = func;
            const cap = name.charAt(0).toUpperCase() + name.slice(1);
            this.context[cap] = func;
        });
    }

    /**
     * .spec 스크립트 실행 및 상태 계산
     */
    execute(specScript: string): SpecEngineState {
        this.state = {};
        const lines = specScript.split("\n");

        lines.forEach((line) => {
            let trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("//")) return;

            const match = trimmed.match(/^([a-zA-Z가-힣0-9_]+)\s*=\s*(.+)$/);
            if (match) {
                const key = match[1];
                let expr = this.preprocessExpression(match[2]);
                this.evaluateLine(key, expr);
            }
        });

        return this.state;
    }

    /**
     * if-else 구문을 삼항 연산자로 변환
     */
    private preprocessExpression(expr: string): string {
        if (expr.startsWith("if")) {
            const ifPattern = /^if\s*\((.+)\)\s*(.+)\s+else\s+(.+)$/;
            const match = expr.match(ifPattern);
            if (match) {
                return `(${match[1]}) ? (${match[2]}) : (${match[3]})`;
            }
        }
        return expr;
    }

    /**
     * 표현식 평가 (동적 함수 생성)
     */
    private evaluateLine(key: string, expression: string) {
        try {
            const allKeys = [...Object.keys(this.state), ...Object.keys(this.context)];
            const allValues = [...Object.values(this.state), ...Object.values(this.context)];
            const dynamicFunc = new Function(...allKeys, `return ${expression};`);
            this.state[key] = dynamicFunc(...allValues);
        } catch (e) {
            this.state[key] = "Error";
        }
    }
}
