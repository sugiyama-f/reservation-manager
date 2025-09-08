"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Stack,
  TextField,
  Alert,
} from "@mui/material";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") || "/";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    setLoading(false);
    if (res?.error) {
      setErr("Invalid email or password");
      return;
    }
    router.push(callbackUrl);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card>
        <CardHeader
          title="Sign in"
          subheader="Use demo@example.com / demo1234"
        />
        <CardContent>
          <Box component="form" onSubmit={onSubmit}>
            <Stack spacing={2}>
              {err && <Alert severity="error">{err}</Alert>}
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
              />
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
