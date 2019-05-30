export function incrementAsync() {
	return (dispatch) => {
		setTimeout(function() {
			dispatch(
				{
					type: 'INCREMENT_COUNTER'
				}
			)
		}, 1000)
	}
}

export function increment() {
	return {
		type: 'INCREMENT_COUNTER'
	}
}

export function decrement() {
	return {
		type: 'DECREMENT_COUNTER'
	}
}