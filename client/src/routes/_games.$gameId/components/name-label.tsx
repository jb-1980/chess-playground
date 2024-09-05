import { Typography } from "@mui/material"

export const NameLabel = (props: { name: string }) => {
  return <Typography variant="h6">{props.name}</Typography>
}
