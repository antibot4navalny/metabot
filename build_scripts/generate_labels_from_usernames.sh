jq --raw-input --null-input '
  [
    inputs |
    select (. != "") |
    {
      key: .,
      value: "red"
    }
  ] | from_entries'
