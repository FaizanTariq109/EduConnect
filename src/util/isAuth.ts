export const checkAuth = async (setIsAuth: any) => {
  try {
    const res = await fetch("/api/auth");
    if (res.ok) {
      const data = await res.json();
      setIsAuth(true);
      return data.type;
    }

    return "";
  } catch (error) {
    console.error(error);
    return "";
  }
};
