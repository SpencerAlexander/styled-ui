import { useCallback, useRef, useEffect } from 'react';
import { useId } from './use-id';
import { useBasicMap } from './use-basic-map';

export function useFocusAwayHandler(onFocusAwayCallback) {
	const targetRef = useRef();
	const inboundsElements = useBasicMap();

	const onBlur = useCallback(
		event => {
			const inboundsElementsList = Object.values(inboundsElements.map);
			if (targetRef.current || inboundsElementsList.length > 0) {
				const relatedTarget =
					event.relatedTarget || event.explicitOriginalTarget || document.activeElement;
				if (
					onFocusAwayCallback &&
					(!relatedTarget ||
						(!targetRef.current.contains(relatedTarget) &&
							!inboundsElementsList.some(
								ref => ref.current && ref.current.contains(relatedTarget),
							)))
				) {
					onFocusAwayCallback();
				}
			}
		},
		[onFocusAwayCallback, inboundsElements.map],
	);

	useEffect(
		// eslint-disable-next-line consistent-return
		() => {
			const targetList = [
				targetRef.current,
				...Object.values(inboundsElements.map).map(x => x.current),
			].filter(x => x !== null && x !== undefined);
			if (targetList.length > 0) {
				for (const target of targetList) {
					target.addEventListener('focusout', onBlur);
				}
				return () => {
					for (const target of targetList) {
						target.removeEventListener('focusout', onBlur);
					}
				};
			}
		},
		[onBlur, targetRef.current, inboundsElements.map],
	);

	const addInboundsElement = useCallback((id, ref) => inboundsElements.add(id, ref), []);
	const removeInboundsElement = useCallback(id => inboundsElements.remove(id), []);

	return { targetRef, addInboundsElement, removeInboundsElement };
}

export function useAddInboundsElement(addInboundsElement, removeInboundsElement) {
	const targetRef = useRef();
	const id = useId();

	useEffect(
		// eslint-disable-next-line consistent-return
		() => {
			if (id && targetRef.current) {
				addInboundsElement(id, targetRef);

				return () => {
					removeInboundsElement(id);
				};
			}
		},
		[addInboundsElement, removeInboundsElement, targetRef.current, id],
	);

	return targetRef;
}
