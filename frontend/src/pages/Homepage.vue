<script lang="ts">
export default {
  data() {
    return {
      technicianAccess: "",
      adminAccess: "",
      accountType: "" as "locked" | "shared" | "user" | "technician" | "admin",
      logout_err: null as string | null;
    };
  },

  methods: {
    async logout() {
      const res = await fetch("/logout", { method: "GET" });
      if (res.status === 200 || res.status === 401) {
        return window.location.href = "/";
      }
      const resText = await res.text();
      this.logout_err = `Fehler beim abmelden: ${resText}`;
    },
  },
  beforeMount() {
    this.technicianAccess = "loading";
    this.adminAccess = "loading";
    fetch("/checkaccess", { method: "GET" })
      .then((response) => {
        if (response.status === 401) {
          this.$router.push("/login");
          return undefined;
        }

        return response.json();
      })
      .then((data) => {
        if (
          data.technicianAccess &&
          typeof data.technicianAccess === "string"
        ) {
          this.technicianAccess = data.technicianAccess;
        } else {
          this.technicianAccess = "denied";
        }
        if (data.adminAccess && typeof data.adminAccess === "string") {
          this.adminAccess = data.adminAccess;
        } else {
          this.adminAccess = "denied";
        }
        if (data.accountType && typeof data.accountType === "string") {
          this.accountType = data.accountType;
        } else {
          this.accountType = "locked";
        }
      })
      .catch(() => {
        this.technicianAccess = "denied";
        this.adminAccess = "denied";
        this.$router.push("/");
      });
  },
};
</script>

<template>
  <div class="wrapper">
    <v-card>
      <v-card-title> Veranstaltung anmelden </v-card-title>
      <v-card-subtitle>
        Hier können Sie eine Veranstaltung anmelden.
      </v-card-subtitle>
      <v-card-actions>
        <v-btn variant="tonal" width="100%" href="/createevent"
          >zum Formular</v-btn
        >
      </v-card-actions>
    </v-card>
    <v-card>
      <v-card-title> Actions </v-card-title>
      <v-card-text>
        <v-btn
          v-if="accountType !== 'shared' && accountType !== 'locked'"
          prepend-icon="mdi-form-textbox-password"
          @click="$router.push('/chpwd')"
        >
          Passwort ändern
        </v-btn>
        <v-btn
          v-if="technicianAccess !== 'denied'"
          :loading="technicianAccess === 'loading'"
          prepend-icon="mdi-calendar-multiple"
          @click="$router.push('/technician')"
        >
          Events einsehen
        </v-btn>
        <v-btn
          v-if="technicianAccess !== 'denied'"
          :loading="technicianAccess === 'loading'"
          prepend-icon="mdi-pencil-circle"
          @click="$router.push('/logger')"
        >
          Logs einsehen
        </v-btn>
        <v-btn
          prepend-icon="mdi-file-upload"
          @click="$router.push('/myevents')"
        >
          Nachträgliches Hochladen
        </v-btn>
        <v-btn
          v-if="adminAccess !== 'denied'"
          :loading="adminAccess === 'loading'"
          prepend-icon="mdi-security"
          @click="$router.push('/admin')"
        >
          Nutzer verwalten
        </v-btn>
      </v-card-text>
    </v-card>
    <v-card>
      <v-card-title> Logout </v-card-title>
      <v-card-subtitle> {{ logout_err ?? "Abmelden und zurück zum Login" }} </v-card-subtitle>
      <v-card-actions>
        <v-btn
          variant="tonal"
          width="100%"
          prepend-icon="mdi-logout"
          @click="logout()"
        >
          Ausloggen
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<style scoped>
@media screen and (min-width: 700px) {
  .v-card {
    padding: 20px;
  }

  .v-card-title {
    padding: 6px;
    align-items: center;
    justify-content: center;
    display: flex;
    width: 100%;
    font-size: 24px;
    height: 40px;
  }

  .v-card-subtitle {
    padding: 4px;
    align-items: center;
    justify-content: center;
    display: flex;
    width: 100%;
    font-size: 18px;
    height: 24px;
  }

  .wrapper {
    display: flex;
    padding-top: 40px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    gap: 60px;
  }

  .v-card-text {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 10px;
  }
}

@media screen and (max-width: 699.999px) {
  .v-card {
    width: 100%;
  }

  .v-card-title {
    padding: 6px;
    align-items: center;
    justify-content: center;
    display: flex;
    width: 100%;
    font-size: 24px;
    height: 40px;
  }

  .v-card-subtitle {
    padding: 4px;
    align-items: center;
    justify-content: center;
    display: flex;
    width: 100%;
    font-size: 18px;
    height: 24px;
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    gap: 20px;
  }

  .v-card-text {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, 1fr);
    gap: 10px;
  }
}
</style>
