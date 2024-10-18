const Notify = (props) => {
  if(!props.notification) {
    return null
  }

  return (
    <p>{props.notification}</p>
  )
}

export default Notify
