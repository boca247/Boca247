import os
import json
import requests
from datetime import datetime, timedelta, timezone

API_KEY = os.environ.get("API_FOOTBALL_KEY")

BASE_URL = "https://v3.football.api-sports.io"

HEADERS = {
    "x-apisports-key": API_KEY
}

BOCA_ID = 1941


def consultar(endpoint, parametros):

    respuesta = requests.get(
        BASE_URL + endpoint,
        headers=HEADERS,
        params=parametros,
        timeout=30
    )

    respuesta.raise_for_status()

    datos = respuesta.json()

    if datos.get("errors"):
        raise Exception(str(datos["errors"]))

    return datos.get("response", [])


def guardar(datos):

    with open(
        "partido.json",
        "w",
        encoding="utf-8"
    ) as archivo:

        json.dump(
            datos,
            archivo,
            ensure_ascii=False,
            indent=2
        )


def actualizar():

    ahora = datetime.now(timezone.utc)

    desde = (
        ahora - timedelta(days=3)
    ).strftime("%Y-%m-%d")

    hasta = (
        ahora + timedelta(days=7)
    ).strftime("%Y-%m-%d")

    partidos = consultar(
        "/fixtures",
        {
            "team": BOCA_ID,
            "from": desde,
            "to": hasta,
            "season": 2026
        }
    )

    if not partidos:

        guardar({
            "estado": "SIN PARTIDO",
            "local": "Boca Juniors",
            "visitante": "",
            "resultado": "-",
            "competencia": "",
            "minuto": "",
            "incidencias": []
        })

        print("No hay partidos encontrados.")
        return

    estados_vivo = [
        "1H",
        "HT",
        "2H",
        "ET",
        "BT",
        "P"
    ]

    estados_finales = [
        "FT",
        "AET",
        "PEN"
    ]

    partido = None

    for p in partidos:

        estado = p["fixture"]["status"]["short"]

        if estado in estados_vivo:

            partido = p
            break

    if partido is None:

        partidos_ordenados = sorted(
            partidos,
            key=lambda p: p["fixture"]["date"]
        )

        futuros = [
            p for p in partidos_ordenados
            if p["fixture"]["status"]["short"]
            not in estados_finales
        ]

        if futuros:

            partido = futuros[0]

        else:

            partido = partidos_ordenados[-1]

    fixture_id = partido["fixture"]["id"]

    equipos = partido["teams"]

    local = equipos["home"]["name"]

    visitante = equipos["away"]["name"]

    goles = partido["goals"]

    goles_local = goles["home"]

    goles_visitante = goles["away"]

    estado_api = partido["fixture"]["status"]["short"]

    if estado_api in estados_vivo:

        estado = "EN VIVO"

    elif estado_api in estados_finales:

        estado = "FINAL"

    else:

        estado = "PROXIMO"

    minuto = partido["fixture"]["status"].get(
        "elapsed"
    )

    if minuto:

        minuto_texto = str(minuto) + "'"

    else:

        minuto_texto = ""

    incidencias = []

    eventos = consultar(
        "/fixtures/events",
        {
            "fixture": fixture_id
        }
    )

    for evento in eventos:

        tipo = evento.get("type", "")

        jugador = evento.get(
            "player",
            {}
        ).get(
            "name",
            ""
        )

        equipo = evento.get(
            "team",
            {}
        ).get(
            "name",
            ""
        )

        tiempo = evento.get(
            "time",
            {}
        )

        minuto_evento = tiempo.get(
            "elapsed"
        )

        adicional = tiempo.get(
            "extra"
        )

        if minuto_evento is None:

            minuto_evento = ""

        elif adicional:

            minuto_evento = (
                str(minuto_evento)
                + "+"
                + str(adicional)
                + "'"
            )

        else:

            minuto_evento = (
                str(minuto_evento)
                + "'"
            )

        if tipo == "Goal":

            incidencias.append({
                "minuto": minuto_evento,
                "tipo": "gol",
                "jugador": jugador,
                "detalle": equipo
            })

        elif tipo == "Card":

            detalle = evento.get(
                "detail",
                ""
            )

            texto = detalle.lower()

            if "yellow" in texto:

                incidencias.append({
                    "minuto": minuto_evento,
                    "tipo": "amarilla",
                    "jugador": jugador,
                    "detalle": equipo
                })

            elif "red" in texto:

                incidencias.append({
                    "minuto": minuto_evento,
                    "tipo": "roja",
                    "jugador": jugador,
                    "detalle": equipo
                })

        elif tipo == "subst":

            sale = jugador

            entra = evento.get(
                "assist",
                {}
            ).get(
                "name",
                ""
            )

            incidencias.append({
                "minuto": minuto_evento,
                "tipo": "cambio",
                "jugador": entra,
                "detalle":
                    "Entra: "
                    + entra
                    + " | Sale: "
                    + sale
            })

    datos = {

        "estado": estado,

        "fixture_id": fixture_id,

        "local": local,

        "visitante": visitante,

        "resultado":
            str(goles_local or 0)
            + "-"
            + str(goles_visitante or 0),

        "competencia":
            partido["league"]["name"],

        "minuto": minuto_texto,

        "incidencias": incidencias
    }

    guardar(datos)

    print("PARTIDO ACTUALIZADO")
    print(
        local,
        goles_local or 0,
        "-",
        goles_visitante or 0,
        visitante
    )

    print("Estado:", estado)

    print(
        "Incidencias:",
        len(incidencias)
    )


if __name__ == "__main__":

    if not API_KEY:

        raise Exception(
            "No existe API_FOOTBALL_KEY"
        )

    actualizar()
