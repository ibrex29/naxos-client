/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/use-countries.ts
import { useEffect, useState } from "react";
import axios from "axios";

export interface Country {
  name: string;
  alpha2Code: string;
  alpha3Code: string;
  callingCodes: string[];
  capital: string;
  region: string;
  subregion: string;
  flag: string;
}

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      setLoading(true);
      try {
        const response = await axios.get<Country[]>("https://www.apicountries.com/countries");
        setCountries(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch countries");
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, loading, error };
}
