import type { LayoutNode, SplitDirection } from '@dannysir/floating-components';

/**
 * 패널에 적용 가능한 0.4.0 의 크기 제약 (px). 모두 옵셔널.
 * 라이브러리는 패널의 부모 split 방향(main-axis)에 해당하는 값만 실제로 적용한다.
 */
export interface PanelConstraints {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

/** undefined 인 키를 떨어내고 정의된 제약만 남긴다. */
const pickDefined = (constraints: PanelConstraints): PanelConstraints => {
  const result: PanelConstraints = {};
  if (constraints.minWidth !== undefined) result.minWidth = constraints.minWidth;
  if (constraints.minHeight !== undefined) result.minHeight = constraints.minHeight;
  if (constraints.maxWidth !== undefined) result.maxWidth = constraints.maxWidth;
  if (constraints.maxHeight !== undefined) result.maxHeight = constraints.maxHeight;
  return result;
};

/**
 * `targetId` 패널의 제약 4필드를 `next` 로 **교체**한다 (undefined ⇒ 키 삭제).
 * 변경이 없는 노드는 동일 참조를 반환해 불필요한 리렌더를 막는다.
 */
export const applyPanelConstraints = (
  tree: LayoutNode,
  targetId: string,
  next: PanelConstraints,
): LayoutNode => {
  if (tree.type === 'panel') {
    if (tree.id !== targetId) return tree;
    return {
      type: 'panel',
      id: tree.id,
      size: tree.size,
      componentKey: tree.componentKey,
      ...pickDefined(next),
    };
  }

  let changed = false;
  const children = tree.children.map((child) => {
    const updated = applyPanelConstraints(child, targetId, next);
    if (updated !== child) changed = true;
    return updated;
  });
  return changed ? { ...tree, children } : tree;
};

/**
 * `targetId` 패널을 직접 감싸는 SplitNode 의 방향.
 * 루트 패널(부모 split 없음)이거나 찾지 못하면 undefined.
 */
export const getParentSplitDirection = (
  tree: LayoutNode,
  targetId: string,
): SplitDirection | undefined => {
  const walk = (
    node: LayoutNode,
    parentDirection: SplitDirection | undefined,
  ): SplitDirection | undefined => {
    if (node.type === 'panel') {
      return node.id === targetId ? parentDirection : undefined;
    }
    return node.children
      .map((child) => walk(child, node.direction))
      .find((found) => found !== undefined);
  };
  return walk(tree, undefined);
};

/** `targetId` 패널의 현재 제약 (없으면 빈 객체). */
export const getPanelConstraints = (
  tree: LayoutNode,
  targetId: string,
): PanelConstraints => {
  const walk = (node: LayoutNode): PanelConstraints | undefined => {
    if (node.type === 'panel') {
      if (node.id !== targetId) return undefined;
      return pickDefined({
        minWidth: node.minWidth,
        minHeight: node.minHeight,
        maxWidth: node.maxWidth,
        maxHeight: node.maxHeight,
      });
    }
    return node.children.map((child) => walk(child)).find((found) => found !== undefined);
  };
  return walk(tree) ?? {};
};
