import ParameterProperties from '../src/parameter-properties';
import {types} from 'babel-core';

const t = types;
const DECORATOR = 'paramProperties';

describe('ParameterProperties', () => {
    /** @type {ParameterProperties} */
    let paramProps = new ParameterProperties(t);

    /** @type {babel.types.Identifier} */
    let identifier;
    /** @type {babel.types.ClassBody} */
    let classBody;
    /** @type {babel.types.ClassDeclaration} */
    let classDeclaration;
    /** @type {babel.types.Decorator} */
    let decorator;

    beforeEach(() => {
        identifier = t.identifier('MyClass');
        decorator = t.decorator(t.identifier(DECORATOR));
        classBody = t.classBody([]);
        classDeclaration = t.classDeclaration(identifier,
            null,
            classBody,
            [decorator]);
    });

    describe('getDecorator', () => {
        it('returns nothing when class is not decorated', () => {
            classDeclaration.decorators = [];

            const dec = paramProps.getDecorator(classDeclaration);
            expect(dec).toBe(undefined);
        });

        it('returns the proper decorator', () => {
            const random = t.decorator(t.identifier('random'));
            classDeclaration.decorators = [random, decorator, random];

            const dec = paramProps.getDecorator(classDeclaration);
            expect(dec).not.toBeFalsy();
            expect(dec.expression).not.toBeFalsy();
            expect(dec.expression.name).toBe(DECORATOR);
        });

        it('returns it only once', () => {
            classDeclaration.decorators = [decorator, decorator];

            const dec = paramProps.getDecorator(classDeclaration);
            expect(dec).not.toBeFalsy();
            expect(dec.expression).not.toBeFalsy();
            expect(dec.expression.name).toBe(DECORATOR);
        });
    });

    describe('undecorate', () => {
        it('removes all occurrences of our decorator', () => {
            const random = t.decorator(t.identifier('random'));
            // add a random decorator and a second occurrence of our decorator
            classDeclaration.decorators.push(random, decorator);

            paramProps.undecorate(classDeclaration);
            expect(classDeclaration.decorators.length).toBe(1);
            expect(classDeclaration.decorators[0]).toBe(random);
        });
    });

    describe('insertAssignments', () => {
        it('inserts the correct amount of assignments', () => {
            const paramsCount = 3;
            const params = Array(paramsCount).fill().map((e, i) => `prop${i}`);

            const ctor = t.classMethod('constructor',
                t.identifier('constructor'),
                params.map(e => t.identifier(e)),
                t.blockStatement([]));
            const ctorBody = ctor.body.body;
            classBody.body.push(ctor);

            paramProps.insertAssignments(ctor);
            expect(ctorBody.length).toBe(paramsCount);
        });

        it('inserts all expected assignments', () => {
            const paramsCount = 3;
            const params = Array(paramsCount).fill().map((e, i) => `prop${i}`);

            const ctor = t.classMethod('constructor',
                t.identifier('constructor'),
                params.map(e => t.identifier(e)),
                t.blockStatement([]));
            const ctorBody = ctor.body.body;
            classBody.body.push(ctor);

            ctorBody.forEach((node, i) => {
                const expr = node.expression;
                expect(expr.type).toBe('AssignmentExpression');
                expect(expr.operator).toBe('=');
                expect(expr.left.object.name).toBe('this');
                expect(expr.left.property.name).toBe(`prop${i}`);
                expect(expr.right.name).toBe(`prop${i}`);
            });
        });
    });

    describe('insertAssignments with super()', () => {
        it('inserts the correct amount of assignments', () => {
            const paramsCount = 4;
            const params = Array(paramsCount).fill().map((e, i) => `prop${i}`);

            const ctor = t.classMethod('constructor',
                t.identifier('constructor'),
                params.map(e => t.identifier(e)),
                t.blockStatement([
                    // add call to super()
                    t.expressionStatement(
                        t.callExpression(t.super(), [])
                    )
                ]));
            const ctorBody = ctor.body.body;
            classBody.body.push(ctor);

            paramProps.insertAssignments(ctor);
            expect(ctorBody.length).toBe(paramsCount + 1);
        });

        it('inserts after a call to super()', () => {
            const paramsCount = 2;
            const params = Array(paramsCount).fill().map((e, i) => `prop${i}`);

            const ctor = t.classMethod('constructor',
                t.identifier('constructor'),
                params.map(e => t.identifier(e)),
                t.blockStatement([
                    // add call to super()
                    t.expressionStatement(
                        t.callExpression(t.super(), [])
                    )
                ]));
            const ctorBody = ctor.body.body;
            classBody.body.push(ctor);

            ctorBody.forEach((node, i) => {
                const expr = node.expression;

                if (i === 0) {
                    expect(expr.type).toBe('CallExpression');
                    expect(expr.callee.type).toBe('Super');
                    return;
                }

                expect(expr.type).toBe('AssignmentExpression');
                expect(expr.operator).toBe('=');
                expect(expr.left.object.name).toBe('this');
                expect(expr.left.property.name).toBe(`prop${i - 1}`);
                expect(expr.right.name).toBe(`prop${i - 1}`);
            });
        });
    });
});