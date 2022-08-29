walk(
	if type == "object" then
		with_entries(
			if (
				.key |
				contains(".channel_dependent")
			) then
				.
				.key |= rtrimstr(".channel_dependent") |
				if (.value[$channel] != null) then
					.value = .value[$channel]
				else
					.value = empty
				end
			else
			.
			end
		)
	else
		.
	end
)
