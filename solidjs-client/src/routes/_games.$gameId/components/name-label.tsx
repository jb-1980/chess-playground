import { Typography } from "@mui/material"

export const NameLabel = (props: { name: string; rating: number }) => {
  return (
    <Typography variant="h6">
      {props.name} ({props.rating})
    </Typography>
  )
}
