import { styled, alpha } from '@mui/material/styles';

const Search = styled("div")(({ theme }) => ({
    position: "relative",
    borderRadius: 20,
    backgroundColor: alpha(theme.palette.background.default, 1),
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: "100%",
    border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
    "&:focus-within": {
      borderColor: theme.palette.primary.main,
    }
  }));

  export default Search
